import type { APIRoute } from 'astro';
import { getUserByEmail, getUserByUsername } from '../../../lib/db';
import { verifyPassword, generateToken, validateEmail } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return new Response(
        JSON.stringify({ error: 'Email/username and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const jwtSecret = import.meta.env.JWT_SECRET || process.env.JWT_SECRET;

    // Determine if identifier is email or username
    const isEmail = validateEmail(identifier);
    const user = isEmail
      ? await getUserByEmail(identifier)
      : await getUserByUsername(identifier);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

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
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};