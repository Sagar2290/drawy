import { AuthPage } from "@/components/AuthPage";

export default function Signin({ isSignin }: { isSignin: boolean }) {
  return <AuthPage isSignin={true} />;
}
