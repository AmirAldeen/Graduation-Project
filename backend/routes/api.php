<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\IdentityVerificationController;
use App\Http\Controllers\ImageKitController;
use App\Http\Controllers\postController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\SavedPostController;
use App\Http\Controllers\userController;
use App\Http\Resources\UserResource;
use App\Models\SavedPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post("/signup",[AuthController::class, "signup"]);
Route::post("/login",[AuthController::class, "login"]);
Route::get("/user-posts/{id}",[userController::class,"getUserPosts"]);
Route::get("/property",[PropertyController::class,"index"]);
Route::get("/is-post-saved",[SavedPostController::class,"isPostSaved"]);

Route::middleware("auth:sanctum")->group(function () {

        Route::post("/logout",[AuthController::class, "Logout"]);
        Route::get("/user",function(Request $request){
            return new UserResource($request->user());
        });
        Route::apiResource("/users",userController::class);
        Route::apiResource("/post",postController::class);
        Route::get('/imagekit/auth', [ImageKitController::class, 'auth']);
        Route::post('/identity-verification', [IdentityVerificationController::class, 'store']);
        Route::get('/identity-verification', [IdentityVerificationController::class, 'show']);
        Route::post("/saved-posts",[SavedPostController::class,"store"]);
        Route::get("/saved-posts/{id}",[SavedPostController::class,"index"]);

        Route::delete("/saved-posts",[SavedPostController::class,"destroy"]);

}
);

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/users', [AdminController::class, 'getUsers']);
    Route::get('/users/{id}', [AdminController::class, 'getUserDetails']);
    Route::put('/users/{id}', [AdminController::class, 'updateUser']);
    Route::patch('/users/{id}/status', [AdminController::class, 'updateUserStatus']);
    Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
    Route::get('/posts', [AdminController::class, 'getPosts']);
    Route::get('/posts/{id}', [AdminController::class, 'getPostDetails']);
    Route::put('/posts/{id}', [AdminController::class, 'updatePost']);
    Route::patch('/posts/{id}/status', [AdminController::class, 'updatePostStatus']);
    Route::delete('/posts/{id}', [AdminController::class, 'deletePost']);
    Route::get('/rental-requests', [AdminController::class, 'getRentalRequests']);
    Route::patch('/rental-requests/{id}/status', [AdminController::class, 'updateRentalRequestStatus']);
    Route::get('/contracts', [AdminController::class, 'getContracts']);
    Route::patch('/contracts/{id}/status', [AdminController::class, 'updateContractStatus']);
    Route::get('/reviews', [AdminController::class, 'getReviews']);
    Route::delete('/reviews/{id}', [AdminController::class, 'deleteReview']);
    Route::get('/notifications', [AdminController::class, 'getNotifications']);
    Route::get('/settings', [AdminController::class, 'getSettings']);
    Route::put('/settings', [AdminController::class, 'updateSettings']);
    // Identity Verification Admin Routes
    Route::get('/identity-verifications', [IdentityVerificationController::class, 'getAll']);
    Route::get('/identity-verifications/pending', [IdentityVerificationController::class, 'getPending']);
    Route::get('/identity-verifications/{id}', [IdentityVerificationController::class, 'getDetails']);
    Route::post('/identity-verifications/{id}/approve', [IdentityVerificationController::class, 'approve']);
    Route::post('/identity-verifications/{id}/reject', [IdentityVerificationController::class, 'reject']);
});

