import { Home, User, Briefcase, FileText } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"

export function LandingNav() {
  const navItems = [
    { name: 'Home', url: '#', icon: Home },
    { name: 'Stake', url: '/stake', icon: User },
    { name: 'Projects', url: '#', icon: Briefcase },
    { name: 'Resume', url: '#', icon: FileText }
  ]

  return <NavBar items={navItems} />
}