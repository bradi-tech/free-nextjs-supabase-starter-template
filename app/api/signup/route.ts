import VerifyEmail from '@/emails';
import supabaseAdmin from '@/utils/supabase/admin';
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  console.log('signup route');

  try {
    const data = await request.json();
    const supabase = await supabaseAdmin();

    const res = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: data.email,
      password: data.password,
    });

    console.log('res', res);

    if (res.data.properties?.email_otp) {
      try {
        const resendRes = await resend.emails.send({
          from: `Acme <onboarding@${process.env.RESEND_DOMAIN}>`,
          to: [data.email],
          subject: 'Verify Email',
          react: VerifyEmail({
            verificationCode: res.data.properties?.email_otp,
          }),
        });
        console.log('resendRes', resendRes);

        return Response.json(resendRes);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        return Response.json({ error: 'Failed to send verification email' }, { status: 500 });
      }
    } else {
      return Response.json({ data: null, error: res.error });
    }
  } catch (error) {
    console.error('Error in signup route:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
