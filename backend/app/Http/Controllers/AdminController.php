<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Post;
use App\Models\RentalRequest;
use App\Models\Contract;
use App\Models\Review;
use App\Models\SavedPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function dashboard()
    {
        $stats = [
            'total_users' => User::count(),
            'total_apartments' => Post::count(),
            'total_rental_requests' => RentalRequest::count(),
            'active_contracts' => Contract::where('status', 'active')->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Get all users with pagination and search
     */
    public function getUsers(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $search = $request->get('search', '');
        
        $query = User::query();
        
        // If search term is provided, search in multiple fields
        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                // Search in users table
                $q->where('users.name', 'LIKE', "%{$search}%")
                  ->orWhere('users.email', 'LIKE', "%{$search}%");
            })
            ->orWhereHas('identityVerifications', function($q) use ($search) {
                // Search in identity_verifications table
                $q->where('full_name', 'LIKE', "%{$search}%")
                  ->orWhere('document_number', 'LIKE', "%{$search}%");
            });
        }
        
        $users = $query->select('id', 'name', 'email', 'role', 'status', 'avatar', 'created_at')
            ->paginate($perPage);

        return response()->json($users);
    }

    /**
     * Get user details with activities
     */
    public function getUserDetails($id)
    {
        $user = User::with([
            'post' => function ($query) {
                $query->select('id', 'user_id', 'Title', 'Address', 'Price', 'status', 'created_at');
            },
            'contracts' => function ($query) {
                $query->with(['post:id,Title,Address'])->select('id', 'user_id', 'post_id', 'start_date', 'end_date', 'status', 'created_at');
            },
            'rentalRequests' => function ($query) {
                $query->with(['post:id,Title,Address'])->select('id', 'user_id', 'post_id', 'status', 'requested_at', 'created_at');
            },
            'savedPost' => function ($query) {
                $query->with(['post:id,Title,Address'])->select('id', 'user_id', 'post_id', 'created_at');
            },
            'reviews' => function ($query) {
                $query->with(['post:id,Title'])->select('id', 'user_id', 'post_id', 'rating', 'comment', 'status', 'created_at');
            },
            'identityVerifications' => function ($query) {
                $query->select('id', 'user_id', 'document_type', 'document_front_url', 'document_back_url', 'status', 'full_name', 'document_number', 'date_of_birth', 'place_of_birth', 'nationality', 'issue_date', 'expiry_date', 'address', 'admin_notes', 'reviewed_at', 'created_at')
                      ->orderBy('created_at', 'desc');
            }
        ])->findOrFail($id);

        // Get latest identity verification
        $latestIdentity = $user->identityVerifications->first();

        return response()->json([
            'user' => $user->makeHidden(['password', 'remember_token']),
            'identity' => $latestIdentity,
            'activities' => [
                'posts' => $user->post,
                'contracts' => $user->contracts,
                'rental_requests' => $user->rentalRequests,
                'saved_posts' => $user->savedPost,
                'reviews' => $user->reviews,
            ],
            'stats' => [
                'total_posts' => $user->post->count(),
                'total_contracts' => $user->contracts->count(),
                'total_rental_requests' => $user->rentalRequests->count(),
                'total_saved_posts' => $user->savedPost->count(),
                'total_reviews' => $user->reviews->count(),
            ]
        ]);
    }

    /**
     * Update user details
     */
    public function updateUser(Request $request, $id)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'role' => 'sometimes|in:admin,user',
            'status' => 'sometimes|in:active,disabled',
            'avatar' => 'sometimes|nullable|string',
            'password' => 'sometimes|nullable|min:6',
        ]);

        $user = User::findOrFail($id);
        
        // Prevent changing admin role of other admins (optional security)
        if ($request->has('role') && $user->role === 'admin' && $request->role !== 'admin') {
            return response()->json(['message' => 'Cannot change admin role'], 403);
        }

        $user->fill($request->only(['name', 'email', 'role', 'status', 'avatar']));
        
        if ($request->has('password') && $request->password) {
            $user->password = bcrypt($request->password);
        }
        
        $user->save();

        return response()->json(['message' => 'User updated successfully', 'user' => $user]);
    }

    /**
     * Update user status (enable/disable)
     */
    public function updateUserStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:active,disabled',
        ]);

        $user = User::findOrFail($id);
        $user->status = $request->status;
        $user->save();

        return response()->json(['message' => 'User status updated successfully', 'user' => $user]);
    }

    /**
     * Delete a user
     */
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        
        // Prevent deleting admin users
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Cannot delete admin user'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Get all posts with status
     */
    public function getPosts(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $posts = Post::with(['user:id,name,email', 'porperty'])
            ->select('id', 'user_id', 'Title', 'Address', 'Price', 'status', 'created_at')
            ->paginate($perPage);

        return response()->json($posts);
    }

    /**
     * Get post details
     */
    public function getPostDetails($id)
    {
        $post = Post::with(['user:id,name,email', 'porperty', 'postimage'])
            ->findOrFail($id);
        
        return response()->json($post);
    }

    /**
     * Update post details
     */
    public function updatePost(Request $request, $id)
    {
        $request->validate([
            'Title' => 'sometimes|string|max:255',
            'Price' => 'sometimes|numeric',
            'Address' => 'sometimes|string',
            'Description' => 'sometimes|string',
            'City' => 'sometimes|string',
            'Bedrooms' => 'sometimes|integer',
            'Bathrooms' => 'sometimes|integer',
            'status' => 'sometimes|in:active,pending,rented,blocked',
        ]);

        $post = Post::findOrFail($id);
        $post->fill($request->only([
            'Title', 'Price', 'Address', 'Description', 'City',
            'Bedrooms', 'Bathrooms', 'status'
        ]));
        $post->save();

        return response()->json(['message' => 'Post updated successfully', 'post' => $post]);
    }

    /**
     * Update post status (approve/reject/block)
     */
    public function updatePostStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:active,pending,rented,blocked',
        ]);

        $post = Post::findOrFail($id);
        $post->status = $request->status;
        $post->save();

        return response()->json(['message' => 'Post status updated successfully', 'post' => $post]);
    }

    /**
     * Delete a post
     */
    public function deletePost($id)
    {
        $post = Post::findOrFail($id);
        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }

    /**
     * Get all rental requests
     */
    public function getRentalRequests(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $requests = RentalRequest::with(['user:id,name,email', 'post:id,Title,Address'])
            ->select('id', 'user_id', 'post_id', 'status', 'message', 'requested_at', 'created_at')
            ->paginate($perPage);

        return response()->json($requests);
    }

    /**
     * Update rental request status
     */
    public function updateRentalRequestStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $rentalRequest = RentalRequest::findOrFail($id);
        $rentalRequest->status = $request->status;
        $rentalRequest->save();

        return response()->json(['message' => 'Rental request status updated successfully', 'request' => $rentalRequest]);
    }

    /**
     * Get all contracts
     */
    public function getContracts(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $contracts = Contract::with(['user:id,name,email', 'post:id,Title,Address'])
            ->select('id', 'user_id', 'post_id', 'start_date', 'end_date', 'monthly_rent', 'status', 'created_at')
            ->paginate($perPage);

        return response()->json($contracts);
    }

    /**
     * Update contract status
     */
    public function updateContractStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:active,expired,cancelled',
        ]);

        $contract = Contract::findOrFail($id);
        $contract->status = $request->status;
        $contract->save();

        return response()->json(['message' => 'Contract status updated successfully', 'contract' => $contract]);
    }

    /**
     * Get all reviews
     */
    public function getReviews(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $reviews = Review::with(['user:id,name,email', 'post:id,Title'])
            ->select('id', 'user_id', 'post_id', 'rating', 'comment', 'status', 'created_at')
            ->paginate($perPage);

        return response()->json($reviews);
    }

    /**
     * Delete a review
     */
    public function deleteReview($id)
    {
        $review = Review::findOrFail($id);
        $review->status = 'removed';
        $review->save();

        return response()->json(['message' => 'Review removed successfully']);
    }

    /**
     * Get system notifications
     */
    public function getNotifications()
    {
        // For now, return placeholder notifications
        // In a real system, this would come from a notifications table
        $notifications = [
            [
                'id' => 1,
                'type' => 'new_listing',
                'message' => 'New apartment listing pending approval',
                'created_at' => now()->subHours(2),
            ],
            [
                'id' => 2,
                'type' => 'rental_request',
                'message' => 'New rental request received',
                'created_at' => now()->subHours(5),
            ],
        ];

        return response()->json($notifications);
    }

    /**
     * Get platform settings
     */
    public function getSettings()
    {
        // For now, return placeholder settings
        // In a real system, this would come from a settings table
        $settings = [
            'terms_and_conditions' => 'Default terms and conditions...',
            'privacy_policy' => 'Default privacy policy...',
        ];

        return response()->json($settings);
    }

    /**
     * Update platform settings
     */
    public function updateSettings(Request $request)
    {
        $request->validate([
            'terms_and_conditions' => 'nullable|string',
            'privacy_policy' => 'nullable|string',
        ]);

        // For now, just return success
        // In a real system, this would save to a settings table
        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => $request->only(['terms_and_conditions', 'privacy_policy']),
        ]);
    }
}
