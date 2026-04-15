import RegisterForm from "@/components/form/auth/RegisterForm";
import React from "react";

function RegisterPage() {
  return (
    <div className=" mt-3 flex items-center">
      <div className="flex-grow">
        <RegisterForm text="Register to get started" role={"USER"} />
      </div>
    </div>
  );
}

export default RegisterPage;
