import { Home, Coins, Briefcase, PieChart } from 'lucide-react'
import { NavBar } from "@/components/ui/tubelight-navbar"

export function LandingNav() {
  const navItems = [
    { name: 'Home', url: '/Landing', icon: Home },
    { name: 'Stake', url: '/stake', icon: Coins },
    { name: 'Portfolio', url: '/protfolio', icon: PieChart },
  ]

  return <NavBar items={navItems} className={undefined} />
}