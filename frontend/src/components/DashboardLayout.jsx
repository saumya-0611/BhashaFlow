import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout({ children, isAdmin = false }) {
  return (
    <div className="layout surface">
      <Sidebar isAdmin={isAdmin} />
      <div className="layout-main">
        <TopBar />
        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  );
}
