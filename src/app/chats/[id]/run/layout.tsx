
export const metadata = {
  title: "Chat Session",
};

export default function ChatRunLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background md:bg-muted/40 h-dvh w-screen md:p-4 lg:p-8 flex items-center justify-center">
      {children}
    </div>
  );
}
