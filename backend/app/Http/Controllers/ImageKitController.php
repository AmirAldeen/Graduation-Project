<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use ImageKit\ImageKit;
class ImageKitController extends Controller
{
    public function auth(Request $request)
    {
        // Optionally check user permissions here (only authenticated users should get this)
       $imageKit = new ImageKit(
            config('services.imagekit.public_key'),
            config('services.imagekit.private_key'),
            config('services.imagekit.url_endpoint')
        );

        // You can pass a token string (optional) and expiry seconds (optional)
        $authParams = $imageKit->getAuthenticationParameters();

        // $authParams is an array: ['token' => '...', 'expire' => ..., 'signature' => '...']
        return response()->json($authParams);
    }
}
