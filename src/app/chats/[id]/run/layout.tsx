export const metadata = {
  title: "Chat Session",
};

export default function ChatRunLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-muted/40 h-dvh w-screen p-4 md:p-8 flex items-center justify-center">
      {children}
    </div>
  );
}
