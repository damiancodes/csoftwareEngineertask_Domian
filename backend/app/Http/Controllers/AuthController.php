<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
   
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (\Illuminate\Support\Facades\Auth::attempt($request->only('email', 'password'))) {
            $user = \Illuminate\Support\Facades\Auth::user();
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
                'message' => 'Login successful'
            ]);
        }

        throw \Illuminate\Validation\ValidationException::withMessages([
            'email' => ['The provided credentials are incorrect.'],
        ]);
    }

   
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

  
    public function user(Request $request)
    {
        return response()->json($request->user());
    }

  
    public function register(Request $request)
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'required|in:admin,user',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        return response()->json([
            'user' => $user,
            'message' => 'User created successfully'
        ], 201);
    }

  
    public function showUser(Request $request, User $user)
    {
        $currentUser = $request->user();
        
 
        if (!$currentUser->isAdmin() && $currentUser->id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($user);
    }

  
  
    public function updateUser(Request $request, User $user)
    {
        $currentUser = $request->user();
        
       
        if (!$currentUser->isAdmin() && $currentUser->id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $rules = [
            'name' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
        ];

     
        if ($currentUser->isAdmin()) {
            $rules['role'] = 'sometimes|required|in:user,admin';
        }

      
        if ($request->has('password')) {
            $rules['password'] = 'required|string|min:6|confirmed';
        }

        $validatedData = $request->validate($rules);

        if (isset($validatedData['password'])) {
            $validatedData['password'] = Hash::make($validatedData['password']);
        }

        $user->update($validatedData);

        return response()->json([
            'user' => $user->fresh(),
            'message' => 'User updated successfully'
        ]);
    }

   
    public function deleteUser(Request $request, User $user)
    {
        $currentUser = $request->user();
        
     
        if (!$currentUser->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

     
        if ($currentUser->id === $user->id) {
            return response()->json(['message' => 'You cannot delete your own account'], 400);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}