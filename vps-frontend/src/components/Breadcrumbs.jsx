import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaChevronRight, FaHome } from 'react-icons/fa';

const Breadcrumbs = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(x => x);

    // Don't show on dashboard/home
    if (pathnames.length === 0) return null;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', textDecoration: 'none' }}>
                <FaHome />
            </Link>
            {pathnames.map((name, index) => {
                const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;

                // Format name (replace hyphens with spaces and capitalize)
                const formattedName = name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

                return (
                    <React.Fragment key={name}>
                        <FaChevronRight style={{ fontSize: '10px', opacity: 0.5 }} />
                        {isLast ? (
                            <span style={{ fontWeight: '600', color: 'var(--primary)' }}>
                                {formattedName}
                            </span>
                        ) : (
                            <Link to={routeTo} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                                {formattedName}
                            </Link>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default Breadcrumbs;
