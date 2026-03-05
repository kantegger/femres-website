import type { APIRoute } from 'astro';
import { createUser, getUserByEmail, getUserByUsername } from '../../../lib/db';
import { hashPassword, validateEmail, validateUsername, validatePassword, generateToken } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return new Response(
        JSON.stringify({ error: 'Username, email, and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validation
    if (!validateUsername(username)) {
      return new Response(
        JSON.stringify({ 
          error: 'Username must be 3-20 characters, alphanumeric and underscore only' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!validateEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!validatePassword(password)) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const jwtSecret = import.meta.env.JWT_SECRET || process.env.JWT_SECRET;

    if (!jwtSecret) {
      return new Response(
        JSON.stringify({ error: 'Authentication not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already exists
    const existingUserByEmail = await getUserByEmail( email);
    if (existingUserByEmail) {
      return new Response(
        JSON.stringify({ error: 'User with this email already exists' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const existingUserByUsername = await getUserByUsername( username);
    if (existingUserByUsername) {
      return new Response(
        JSON.stringify({ error: 'Username already taken' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create user
    const passwordHash = await hashPassword(password);
    
    const user = await createUser( {
      username,
      email,
      password_hash: passwordHash
    });

    // Generate JWT
    const token = await generateToken(user, jwtSecret);

    // Return user data (without password hash) and token
    const { password_hash, ...userWithoutPassword } = user;
    
    return new Response(
      JSON.stringify({
        user: userWithoutPassword,
        token
      }),
      { 
        status: 201, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    
    const errorMessage = error?.message || 'Unknown server error';
    const response = {
      error: 'Internal server error',
      details: errorMessage,
      timestamp: new Date().toISOString()
    };
    
    return new Response(
      JSON.stringify(response),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'X-Error-Details': errorMessage
        } 
      }
    );
  }
};