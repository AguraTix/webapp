import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" ;
};

const baseStyles =
  "px-10 py-4  rounded font-semibold transition-colors transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

const variants = {
  primary: "bg-primary text-white rounded-full hover:bg-primary/80 hover:scale-105 ",
  secondary: "bg-white text-primary rounded-full hover:bg-gray-100 hover:text-primary/80 hover:scale-105 ",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  className = "",
  ...props
}) => (
  <button
    className={`${baseStyles} ${variants[variant]} ${className}`}
    {...props}
  />
);