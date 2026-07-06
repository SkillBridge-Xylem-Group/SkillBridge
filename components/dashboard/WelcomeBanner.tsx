type WelcomeBannerProps = {
  name: string;
  message: string;
};

export default function WelcomeBanner({ name, message }: WelcomeBannerProps) {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-brand to-[#5A47E0] px-8 py-8 sm:px-10">
      <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
        Welcome back, {name}!
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-white/85 sm:text-base">{message}</p>
    </div>
  );
}