// components/Footer.tsx
export function Footer() {
  return (
    <footer className="py-4 border-t text-center text-sm text-gray-500">
      <p>&copy; {new Date().getFullYear()} Codele. All rights reserved.</p>
    </footer>
  );
}