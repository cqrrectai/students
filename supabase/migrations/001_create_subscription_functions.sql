-- Create function to increment AI exam generation usage
CREATE OR REPLACE FUNCTION increment_ai_exam_usage(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update subscription record
  INSERT INTO subscriptions (
    user_id,
    plan,
    status,
    start_date,
    student_limit,
    exam_limit,
    ai_exam_generations_used,
    ai_exam_generations_limit,
    ai_analytics_used,
    ai_analytics_limit,
    ai_credits_renewal_date,
    created_at
  )
  VALUES (
    user_id,
    'free',
    'active',
    NOW(),
    10,
    999999,
    1,
    3,
    0,
    3,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    ai_exam_generations_used = subscriptions.ai_exam_generations_used + 1,
    updated_at = NOW();
END;
$$;

-- Create function to increment AI analytics usage
CREATE OR REPLACE FUNCTION increment_ai_analytics_usage(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update subscription record
  INSERT INTO subscriptions (
    user_id,
    plan,
    status,
    start_date,
    student_limit,
    exam_limit,
    ai_exam_generations_used,
    ai_exam_generations_limit,
    ai_analytics_used,
    ai_analytics_limit,
    ai_credits_renewal_date,
    created_at
  )
  VALUES (
    user_id,
    'free',
    'active',
    NOW(),
    10,
    999999,
    0,
    3,
    1,
    3,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    ai_analytics_used = subscriptions.ai_analytics_used + 1,
    updated_at = NOW();
END;
$$;