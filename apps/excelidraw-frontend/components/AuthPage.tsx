"use client";

import { Button } from "@repo/ui/button";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="p-6 m-2 bg-white rounded text-black">
        <div className="p-2">
          <input type="text" placeholder="Email"></input>
        </div>
        <div className="p-2">
          <input type="password" placeholder="Password"></input>
        </div>

        <div className="pt-2">
          <Button
            variant={"primary"}
            size="lg"
            className="h-12 px-6"
            onClick={() => {
              alert("hh");
            }}
          >
            {isSignin ? "Sign in" : "Sign up"}
          </Button>
        </div>
      </div>
    </div>
  );
}
