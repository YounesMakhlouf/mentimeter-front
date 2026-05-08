import {Link} from "react-router";
import styled from "styled-components";
import {Avatar, Logo} from "../design/primitives.tsx";
import {useAuth} from "../hooks/useAuth.ts";

const Aside = styled.aside`
    background: var(--ink);
    color: var(--paper);
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;

    @media (max-width: 800px) {
        flex-direction: row;
        align-items: center;
        gap: 16px;
        padding: 16px 20px;
    }
`;

const NavItem = styled.button<{$active?: boolean}>`
    justify-content: flex-start;
    text-align: left;
    border: none;
    background: ${({$active}) => $active ? 'rgba(255,255,255,.12)' : 'transparent'};
    color: var(--paper);
    box-shadow: none;
    padding: 12px 14px;
    border-radius: 12px;
    font-weight: ${({$active}) => $active ? 700 : 500};
    font-family: var(--body);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;

    &:hover { background: rgba(255,255,255,.08); }
`;

const Spacer = styled.div`flex: 1;`;

const PlanCard = styled.div`
    background: rgba(255, 255, 255, .08);
    border-radius: 16px;
    padding: 16px;
    margin-top: 16px;
    @media (max-width: 800px) { display: none; }
`;

const UpgradeBtn = styled.button`
    background: var(--opt-c);
    color: var(--ink);
    border: 2.5px solid var(--ink);
    margin-top: 12px;
    width: 100%;
    padding: 10px 14px;
    font-size: 14px;
    font-weight: 700;
    font-family: var(--body);
    border-radius: var(--r-md);
    cursor: pointer;
`;

const UserRow = styled.div`
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 8px 6px;
    margin-top: 8px;
`;

const LogoutLink = styled(Link)`
    color: var(--paper);
    padding: 6px 10px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    &:hover { background: rgba(255,255,255,.1); }
`;

const navItems = [
    {icon: '🏠', label: 'Home', active: true},
    {icon: '📝', label: 'My quizzes'},
    {icon: '📊', label: 'Reports'},
    {icon: '👥', label: 'Classes'},
    {icon: '🎨', label: 'Templates'},
];

export default function SideBar() {
    const {username, email} = useAuth();
    return (
        <Aside>
            <div style={{padding: '4px 10px 18px'}}>
                <Logo size={26} mono/>
            </div>
            {navItems.map((it, i) => (
                <NavItem key={i} $active={it.active}>
                    <span style={{fontSize: 18}}>{it.icon}</span> {it.label}
                </NavItem>
            ))}
            <Spacer/>
            <PlanCard>
                <div style={{fontWeight: 700, marginBottom: 4}}>Free plan</div>
                <div style={{fontSize: 12, opacity: 0.7, lineHeight: 1.4}}>
                    Unlimited games · Up to 50 players per session.
                </div>
                <UpgradeBtn>Upgrade to Pro</UpgradeBtn>
            </PlanCard>
            <UserRow>
                <Avatar name={username || email || 'You'} size={36}/>
                <div style={{flex: 1, minWidth: 0}}>
                    <div style={{fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {username || 'You'}
                    </div>
                    <div style={{fontSize: 11, opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                        {email || '—'}
                    </div>
                </div>
                <LogoutLink to="/logout" title="Log out">↗</LogoutLink>
            </UserRow>
        </Aside>
    );
}
