import MobileWarningPopup from '@/components/shared/MobileWarningPopup';

export const metadata = {
  title: 'Resume Builder',
};

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <MobileWarningPopup />
    </>
  );
}
