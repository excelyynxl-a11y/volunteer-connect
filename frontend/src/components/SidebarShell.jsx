import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Menu, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import './SidebarShell.css';

const mobileQuery = '(max-width: 1050px)';
const isMobileViewport = () => window.matchMedia
  ? window.matchMedia(mobileQuery).matches
  : window.innerWidth <= 1050;

const SidebarShell = ({ className, sidebarCollapsed, label, children }) => {
  const [openPath, setOpenPath] = useState(null);
  const { pathname } = useLocation();
  const sidebarRef = useRef(null);
  const triggerRef = useRef(null);
  const closeRef = useRef(null);
  const sidebarId = `${className}-navigation`;

  const subscribe = useCallback((notify) => {
    const onResize = () => {
      if (!isMobileViewport()) setOpenPath(null);
      notify();
    };
    if (window.matchMedia) {
      const media = window.matchMedia(mobileQuery);
      media.addEventListener('change', onResize);
      return () => media.removeEventListener('change', onResize);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const isMobile = useSyncExternalStore(subscribe, isMobileViewport, () => false);
  const mobileOpen = isMobile && openPath === pathname;
  if (openPath !== null && openPath !== pathname) setOpenPath(null);
  const collapsed = !isMobile && sidebarCollapsed;
  const closeMobileMenu = () => setOpenPath(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    const main = sidebarRef.current.closest(`.${className.replace('-sidebar', '-dashboard')}`)?.querySelector(':scope > main');
    const previousInert = main?.inert;
    document.body.style.overflow = 'hidden';
    if (main) main.inert = true;
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (main) main.inert = previousInert;
      if (isMobileViewport()) trigger?.focus();
    };
  }, [mobileOpen, className]);

  const handleKeyDown = (event) => {
    if (!mobileOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMobileMenu();
    }
    if (event.key === 'Tab') {
      const buttons = sidebarRef.current.querySelectorAll('button:not(:disabled), a[href], [tabindex="0"]');
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  };

  return (
    <>
      <header className="dashboard-mobile-bar">
        <button ref={triggerRef} type="button" className="dashboard-menu-toggle"
          aria-label="Open navigation menu" aria-controls={sidebarId} aria-expanded={mobileOpen}
          onClick={() => setOpenPath(pathname)}>
          <Menu size={22} aria-hidden="true" />
          <span>Menu</span>
        </button>
        <span>{label} dashboard</span>
      </header>
      {mobileOpen && <button type="button" className="dashboard-sidebar-backdrop" tabIndex={-1}
        aria-label="Close navigation overlay" onClick={closeMobileMenu} />}
      <aside ref={sidebarRef} id={sidebarId}
        className={`${className}${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}
        role={mobileOpen ? 'dialog' : undefined} aria-modal={mobileOpen ? true : undefined}
        aria-label={`${label} navigation`} aria-hidden={isMobile && !mobileOpen ? true : undefined}
        inert={isMobile && !mobileOpen} onKeyDown={handleKeyDown}>
        {isMobile && <button ref={closeRef} type="button" className="dashboard-menu-close"
          aria-label="Close navigation menu" onClick={closeMobileMenu}>
          <X size={22} aria-hidden="true" />
          <span>Close</span>
        </button>}
        {children({ collapsed, isMobile, closeMobileMenu })}
      </aside>
    </>
  );
};

export default SidebarShell;
