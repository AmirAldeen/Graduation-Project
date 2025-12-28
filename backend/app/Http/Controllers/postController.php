<?php

namespace App\Http\Controllers;

use App\Http\Resources\PostDetailsResource;
use App\Models\post;
use App\Http\Requests\StorepostRequest;
use App\Http\Requests\UpdatepostRequest;
use App\Http\Resources\PostResource;
use App\Models\PostImage;
use Illuminate\Http\Request;

class postController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Post::query();

        if($request->has("location") && !empty($request->location))
            $query->where("City",$request->location);

        if($request->has("min") && !empty($request->min))
            $query->where("Price",">=",$request->min);

        if($request->has("max") && !empty($request->max))
            $query->where("Price","<=",$request->max);

        if($request->has("type") && !empty($request->type))
            $query->where("Type","=",$request->type);

        if($request->has("property") && !empty($request->property))
            $query->where("porperty_id",$request->property);

        if($request->has("bedroom") && !empty($request->bedroom))
            $query->where("Bedrooms","=",$request->bedroom);

        $posts = $query->get();
        return PostResource::collection($posts);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorepostRequest $request)
    {
        // Get authenticated user
        $user = $request->user();
        
        // Security check: Ensure user is authenticated
        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized. Please log in to create posts.',
            ], 401);
        }
        
        // Check identity verification status - CRITICAL SECURITY CHECK
        // Check identity_status directly from users table (identityVerifications is a HasMany relationship)
        if ($user->identity_status !== 'approved') {
            return response()->json([
                'message' => 'Identity verification required. Please submit your identity documents for verification before creating posts.',
                'identity_status' => $user->identity_status ?? 'none',
            ], 403);
        }

        $data = $request->validated();
        $post = Post::create([
            'user_id' => $user->id, // Use authenticated user's ID for security
            'porperty_id' => $request->porperty_id,
            'Title' => $request->title,
            'Description' => $request->description,
            'Type' => $request->type,
            'Price' => $request->price,
            'Bedrooms' => $request->bedrooms,
            'Bathrooms' => $request->bathrooms,
            'Total_Size' => $request->total_size,
            'School' => $request->school,
            'Resturant' => $request->resturant,
            'Bus' => $request->bus,
            'City' => $request->city,
            'Address' => $request->address,
            'Latitude' => $request->latitude,
            'Longitude' => $request->longitude,
            'Pet_Policy' => $request->pet_policy,
            'Utilities_Policy' => $request->utilities_policy,
            'Income_Policy' => $request->income_policy,
        ]);

        if (!empty($request["images"]) && is_array($request["images"])) {
            $images = collect($request["images"])->map(function($url) use ($post) {
                return [
                    "Image_URL" => $url,
                    "post_id" => $post->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            })->toArray();
            PostImage::insert($images);
        }

        $post = $post->fresh()->load('postimage');

        return response(new PostResource($post),201);
    }

    /**
     * Display the specified resource.
     */
    public function show(post $post)
    {
        $post = Post::where("id","=",$post->id)->firstOrFail();
        return response()->json(new PostDetailsResource($post),200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatepostRequest $request, post $post)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(post $post)
    {
        //
    }



}
