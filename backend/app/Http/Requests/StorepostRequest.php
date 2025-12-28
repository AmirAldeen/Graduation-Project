<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorepostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // user_id removed - will use authenticated user's ID for security
            "title" => "required|string",
            "price" => "required|numeric",
            "address" => "required:string",
            "description" => "required",
            "city" => "required",
            "bedrooms" => "required|integer:strict",
            "bathrooms" => "required|integer:strict",
            "latitude" => "required",
            "longitude" => "required",
            "type" => "required|in:rent,buy",
            "porperty_id" => "required|exists:porperties,id",
            "utilities_policy" => "required|in:owner,tenant,share",
            "pet_policy" => "required|boolean:strict",
            "income_policy" => "required",
            "total_size" => "required|numeric",
            "bus" => "required|integer:strict",
            "resturant" => "required|integer:strict",
            "school" => "required|integer:strict",
            "images" => "required|array",
            "images.*" => "required|string"
        ];
    }
}
