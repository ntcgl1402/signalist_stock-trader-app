'use client'
import {CountrySelectField} from '@/components/forms/CountrySelectField';
import FooterLink from '@/components/forms/FooterLink';
import InputField from '@/components/forms/InputField';
import SelectField from '@/components/forms/SelectField';
import { Button } from '@/components/ui/button';
import { signInWithEmail } from '@/lib/action/auth.action';
import { INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from '@/lib/constant';
import { useRouter } from 'next/navigation';
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner';



const SignIn = () => {

  const router = useRouter();

  const{
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur'
  }, );
  const onSubmit = async (data: SignInFormData) => {
    try {
      const result = await signInWithEmail(data);
      if (result.success) {
        router.push('/');
      }
    } catch (error) {
      console.log(error);
      toast('Sign in failed. Please try again.', { description: 'Failed to sign in' });
    }
  }

  return (
    <>
      <h1 className='form-title'>Sign In</h1>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
        <InputField
          name="email"
          label="Email"
          placeholder="example@email.com"
          register={register}
          error={errors.email}
          validation = {{ required: 'Email is required', pattern: /^\w+@\w+\.\w+$/ }}
        />
        <InputField
          name="password"
          label="Password"
          placeholder="Enter your password"
          type='password'
          register={register}
          error={errors.password}
          validation = {{ required: 'Password is required', minLength: 8 }}
        />
        <Button type='submit' disabled={isSubmitting} className='yellow-btn w-full mt-5'>
          {isSubmitting ? 'Loading...' : 'Login'}
        </Button>
      </form>
      <FooterLink text='Dont have an account?' linkText='Create an account' href='/sign-up'/>
    </>
  )
}

export default SignIn
