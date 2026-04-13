import { Link } from 'react-router-dom'
import { useTranslation } from '../../i18n'

export default function Footer() {
  const t = useTranslation()

  return (
    <div className="text-text-muted border-border mt-16 w-full border-t px-4 pt-12">
      <div className="mx-auto flex max-w-[1280px] flex-wrap gap-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" className="size-12">
              <path
                fill="var(--logo-ring)"
                d="M512,95A417.14,417.14,0,0,1,674.29,896.27,417.14,417.14,0,0,1,349.71,127.73,414.29,414.29,0,0,1,512,95m0-95C229.23,0,0,229.23,0,512s229.23,512,512,512,512-229.23,512-512S794.77,0,512,0Z"
              />
              <polygon
                fill="var(--logo-inner)"
                points="278.19 279.12 204.29 369.27 204.29 416.09 254.9 416.09 254.9 745.08 362.99 745.08 362.99 279.12 278.19 279.12"
              />
              <path
                fill="var(--logo-inner)"
                d="M819.7,443.62c-.9-90.84-75.12-164.24-166.74-164.69a166,166,0,0,0-115.89,47.65,175.87,175.87,0,0,0-119.31-47.64l-1.06,0a116.39,116.39,0,0,0-34.61,5.28V397.11h0a52.2,52.2,0,0,1,38-16.73,64.38,64.38,0,0,1,16.37,2.31A62.84,62.84,0,0,1,469,404.09l.16.2a52.23,52.23,0,0,1,10.93,32.34V745H588.19V442.25a58,58,0,0,1,12.92-36.44,64.34,64.34,0,0,1,99.42,0l.16.19a51.38,51.38,0,0,1,10.94,32V745H819.71V443.62Z"
              />
            </svg>
            <h1 className="text-3xl font-bold">1MCLOUD</h1>
          </div>
          <div className="max-w-lg">{t('footer.desc')}</div>
        </div>
        <div className="m-auto flex flex-wrap gap-20">
          <div className="flex flex-col gap-4">
            <h4 className="text-text-primary font-bold">{t('footer.services')}</h4>
            <Link to="/#vps" className="social-link cursor-pointer">
              VPS
            </Link>
            <Link to="/#vps" className="social-link cursor-pointer">
              VPS GPU
            </Link>
            <Link to="/#proxy" className="social-link cursor-pointer">
              {t('footer.residentialProxy')}
            </Link>
            <Link to="/#proxy" className="social-link cursor-pointer">
              Proxy Datacenter
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-text-primary font-bold">{t('footer.info')}</h4>
            <Link to="/#hero" className="social-link cursor-pointer">
              {t('footer.aboutUs')}
            </Link>
            <a href="/contact" className="social-link cursor-pointer">
              {t('footer.contact')}
            </a>
            <a className="social-link cursor-pointer">{t('footer.terms')}</a>
            <a className="social-link cursor-pointer">{t('footer.privacy')}</a>
          </div>
        </div>
      </div>
      <div className="border-border mx-auto mt-12 max-w-[1280px] border-t text-center">
        {t('footer.copyright')}
      </div>
    </div>
  )
}
