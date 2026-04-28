import { AuthPage } from "@/components/AuthPage";

export default function Signup({ isSignin }: { isSignin: boolean }) {
  return <AuthPage isSignin={false} />;
}
