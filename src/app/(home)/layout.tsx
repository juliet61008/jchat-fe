import { Button } from "@/components/ui/button";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <div>
            <Button variant={'outline'}>버튼</Button>
            {children}
        </div>
    );
}