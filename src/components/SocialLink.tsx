import type { IconType } from 'react-icons'
import { FaFacebookF, FaGithub, FaInstagram, FaLinkedinIn, FaTelegram, FaWhatsapp, FaXTwitter } from 'react-icons/fa6'
import { FiGlobe, FiMail, FiPhone } from 'react-icons/fi'
import { ArrowUpRight } from './Icons'

const ICONS: [RegExp, IconType][] = [
  [/github/i, FaGithub], [/linkedin/i, FaLinkedinIn], [/facebook/i, FaFacebookF], [/instagram/i, FaInstagram],
  [/^x$|twitter/i, FaXTwitter], [/whats ?app/i, FaWhatsapp], [/telegram/i, FaTelegram], [/mail/i, FiMail], [/phone|tel|mobile/i, FiPhone],
]
const iconFor = (name: string): IconType => ICONS.find(([re]) => re.test(name))?.[1] ?? FiGlobe

interface Props { name: string; href: string; icon?: IconType }

/** Icon + platform name. The URL lives only in href and is never rendered as text. */
export default function SocialLink({ name, href, icon }: Props) {
  const Icon = icon ?? iconFor(name)
  const external = /^https?:\/\//i.test(href)
  return (
    <a className="slink" href={href} {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}>
      <Icon className="slink-ic" aria-hidden="true" />
      <span>{name}</span>
      {external && <span className="slink-arrow"><ArrowUpRight /></span>}
    </a>
  )
}
