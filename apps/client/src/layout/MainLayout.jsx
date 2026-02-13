import { Outlet } from 'react-router-dom';

export function MainLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <main>
        <Outlet />
      </main>
    </div>
  );
}