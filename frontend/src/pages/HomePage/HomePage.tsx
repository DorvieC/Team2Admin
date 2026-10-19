import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import styles from './HomePage.module.css';

import heroCity    from '../../assets/images/hero-city.png';
import heroCar     from '../../assets/images/hero-car.png';
import heroDeliver from '../../assets/images/hero-deliver.png';
import arrowRight  from '../../assets/icons/arrow-right.svg';

import featDelivery  from '../../assets/icons/feat-delivery.svg';
import featReturn    from '../../assets/icons/feat-return.svg';
import featShield    from '../../assets/icons/feat-shield.svg';
import featHeadphone from '../../assets/icons/feat-headphone.svg';

import prodHeadphone from '../../assets/images/prod-headphone.png';
import prodSpeaker   from '../../assets/images/prod-speaker.png';
import prodMug       from '../../assets/images/prod-mug.png';
import prodBackpack  from '../../assets/images/prod-backpack.png';

import stars45 from '../../assets/icons/stars-45.svg';
import stars5  from '../../assets/icons/stars-5.svg';
import starFull from '../../assets/icons/star-full.png';
import starHalf from '../../assets/icons/star-half.svg';

import cartProductIcon from '../../assets/icons/cart-product.svg';

import rowSneakers from '../../assets/images/row-sneakers.png';
import rowDishes   from '../../assets/images/row-dishes.png';
import rowTable    from '../../assets/images/row-table.png';
import rowYoga     from '../../assets/images/row-yoga.png';

import newPowerbank from '../../assets/images/new-powerbank.png';
import newBlender   from '../../assets/images/new-blender.png';
import newBedding   from '../../assets/images/new-bedding.png';
import newFitband   from '../../assets/images/new-fitband.png';

import smallThermos from '../../assets/images/small-thermos.png';
import smallCharger from '../../assets/images/small-charger.png';
import smallBlanket from '../../assets/images/small-blanket.png';
import smallLamp    from '../../assets/images/small-lamp.png';

import mailIcon      from '../../assets/icons/mail.svg';
import moneyBag      from '../../assets/icons/money-bag.svg';
import feedbackIcon  from '../../assets/icons/feedback.svg';
import headphoneFoot from '../../assets/icons/headphone-footer.svg';
import logoImg       from '../../assets/images/logo-full.png';

function Stars5() {
  return (
    <div className={styles.newCardStars}>
      {[0,1,2,3,4].map(i => (
        <img key={i} src={starFull} alt="★" className={styles.starImg} />
      ))}
    </div>
  );
}

function Stars45() {
  return (
    <div className={styles.newCardStars}>
      {[0,1,2,3].map(i => (
        <img key={i} src={starFull} alt="★" className={styles.starImg} />
      ))}
      <img src={starHalf} alt="½★" className={styles.starHalf} />
    </div>
  );
}

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = async (productId: number) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try { await addItem(productId); } catch { /* silent */ }
  };

  const goToProduct = (id: number) => navigate(`/product/${id}`);

  return (
    <div className={styles.page}>
      <Header full />

      <div className={styles.inner}>
        <div className={styles.heroWrap}>
          <div className={styles.hero}>
            <div className={styles.heroContent}>
              <div className={styles.heroBadge}>НОВИНКА</div>
              <h1 className={styles.heroTitle}>{`Доставка по місту\nдень у день`}</h1>
              <p className={styles.heroSub}>Замовляйте до 13:00 - отримуйте вже сьогодні</p>
              <button className={styles.heroBtn}>
                Дізнатися більше
                <img src={arrowRight} alt="" className={styles.heroArrow} />
              </button>
            </div>

            <img src={heroCity}    alt=""  className={styles.heroCity} />
            <img src={heroCar}     alt=""  className={styles.heroCar} />
            <img src={heroDeliver} alt=""  className={styles.heroDeliver} />
          </div>
        </div>

        <div className={styles.featuresWrap}>
          <div className={styles.featuresRow}>
            <div className={styles.featCard}>
              <img src={featDelivery} alt="" className={styles.featIcon} />
              <span className={styles.featText}>Швидка доставка по всьому місту</span>
            </div>
            <div className={styles.featCard}>
              <img src={featReturn} alt="" className={styles.featIconRotate} />
              <span className={styles.featText}>Повернення товару протягом 14 днів</span>
            </div>
            <div className={styles.featCard}>
              <img src={featShield} alt="" className={styles.featIconShield} />
              <span className={styles.featText}>Гарантія якості на всі товари</span>
            </div>
            <div className={styles.featCard}>
              <img src={featHeadphone} alt="" className={styles.featIconHead} />
              <div className={styles.featText}>
                <div>Підтримка 24/7</div>
                <div>ми завжди поруч</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sectionWrap}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Рекомендації для вас</span>
            <span className={styles.sectionAll} onClick={() => navigate('/all-products')} style={{ cursor: 'pointer' }}>Дивитись усі →</span>
          </div>
          <div className={styles.featuredGrid}>

            <div className={styles.prodCard} onClick={() => goToProduct(1)} style={{cursor:'pointer'}}>
              <img src={prodHeadphone} alt="Бездротові навушники" className={styles.prodCardImg} />
              <span className={`${styles.prodBadge} ${styles.badgeRed}`}>-30%</span>
              <img src={stars45} alt="4.5 зірки" className={styles.prodStars} />
              <div className={styles.prodName}>Бездротові навушники</div>
              <div className={styles.prodPriceRow}>
                <div>
                  <span className={styles.prodPrice}>1 972 ₴</span>
                  <span className={styles.prodOldPrice}>2 560 ₴</span>
                </div>
                <img src={cartProductIcon} alt="Додати в кошик" className={styles.prodCartBtn} onClick={(e) => { e.stopPropagation(); handleAddToCart(1); }} style={{cursor:'pointer'}} />
              </div>
            </div>

            <div className={styles.prodCard} style={{ borderRadius: 25, cursor:'pointer' }} onClick={() => goToProduct(2)}>
              <img src={prodSpeaker} alt="Розумна колонка" className={styles.prodCardImg} style={{ borderRadius: '25px 25px 0 0' }} />
              <span className={`${styles.prodBadge} ${styles.badgeYellow}`}>ХІТ</span>
              <img src={stars5} alt="5 зірок" className={styles.prodStars} />
              <div className={styles.prodName}>Розумна колонка</div>
              <div className={styles.prodPriceRow}>
                <div>
                  <span className={styles.prodPrice}>1 250 ₴</span>
                  <span className={styles.prodOldPrice}>1 420 ₴</span>
                </div>
                <img src={cartProductIcon} alt="Додати в кошик" className={styles.prodCartBtn} onClick={(e) => { e.stopPropagation(); handleAddToCart(2); }} style={{cursor:'pointer'}} />
              </div>
            </div>

            <div className={styles.prodCard} style={{ borderRadius: 25, cursor:'pointer' }} onClick={() => goToProduct(3)}>
              <img src={prodMug} alt="Термокухоль 500 мл" className={styles.prodCardImg} style={{ borderRadius: '25px 25px 0 0' }} />
              <span className={`${styles.prodBadge} ${styles.badgeRed}`}>-15%</span>
              <img src={stars45} alt="4.5 зірки" className={styles.prodStars} />
              <div className={styles.prodName}>Термокухоль 500 мл</div>
              <div className={styles.prodPriceRow}>
                <div>
                  <span className={styles.prodPrice}>298 ₴</span>
                  <span className={styles.prodOldPrice}>350 ₴</span>
                </div>
                <img src={cartProductIcon} alt="Додати в кошик" className={styles.prodCartBtn} onClick={(e) => { e.stopPropagation(); handleAddToCart(3); }} style={{cursor:'pointer'}} />
              </div>
            </div>

            <div className={styles.prodCard} style={{ borderRadius: 25, cursor:'pointer' }} onClick={() => goToProduct(4)}>
              <img src={prodBackpack} alt="Рюкзак міський 20 л" className={styles.prodCardImg} style={{ borderRadius: '25px 25px 0 0' }} />
              <span className={`${styles.prodBadge} ${styles.badgeGreen}`}>НОВЕ</span>
              <img src={stars5} alt="5 зірок" className={styles.prodStars} />
              <div className={styles.prodName}>Рюкзак міський 20 л</div>
              <div className={styles.prodPriceRow}>
                <div>
                  <span className={styles.prodPrice}>890 ₴</span>
                </div>
                <img src={cartProductIcon} alt="Додати в кошик" className={styles.prodCartBtn} onClick={(e) => { e.stopPropagation(); handleAddToCart(4); }} style={{cursor:'pointer'}} />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sectionWrap}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Історія переглядів</span>
            <span className={styles.sectionAll} onClick={() => navigate('/all-products')} style={{ cursor: 'pointer' }}>Дивитись усі →</span>
          </div>
          <div className={styles.rowCards}>
            {[
              { img: rowSneakers, name: 'Кросівки для бігу',   price: '3 360 ₴', nameTop: 15,  priceTop: 48,  id: 15 },
              { img: rowDishes,   name: 'Набір посуду',         price: '2 340 ₴', nameTop: 16,  priceTop: 63,  id: 16 },
              { img: rowTable,    name: 'Стіл-трансформер',     price: '7 450 ₴', nameTop: 15,  priceTop: 72,  id: 17 },
              { img: rowYoga,     name: 'Йога-килимок',         price: '720 ₴',   nameTop: 28,  priceTop: 68,  id: 18 },
            ].map((item) => (
              <div key={item.name} className={styles.rowCard} onClick={() => goToProduct(item.id)} style={{cursor:'pointer'}}>
                <img src={item.img} alt={item.name} className={styles.rowCardImg} />
                <div className={styles.rowCardName} style={{ top: item.nameTop }}>{item.name}</div>
                <div className={styles.rowCardPrice} style={{ top: item.priceTop }}>{item.price}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.sectionWrap}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Топ продажів</span>
            <span className={styles.sectionAll} onClick={() => navigate('/all-products')} style={{ cursor: 'pointer' }}>Дивитись усі →</span>
          </div>
          <div className={styles.newGrid}>
            {[
              { img: newPowerbank, name: 'Повербанк 2000 mAh',      price: '780 ₴',   num: '1', stars: <Stars45 />, id: 11 },
              { img: newBlender,   name: 'Блендер занурювальний',   price: '1 190 ₴', num: '2', stars: <Stars5 />,  id: 12 },
              { img: newBedding,   name: 'Постільна білизна, сатин', price: '750 ₴',  num: '3', stars: <Stars5 />,  id: 13 },
              { img: newFitband,   name: 'Фітнес-браслет Sport',    price: '990 ₴',   num: '4', stars: <Stars5 />,  id: 14 },
            ].map((item) => (
              <div key={item.name} className={styles.newCard} onClick={() => goToProduct(item.id)} style={{cursor:'pointer'}}>
                <div className={styles.newCardBg} />
                <img src={item.img} alt={item.name} className={styles.newCardImg} />
                <div className={styles.newNumBadge}>{item.num}</div>
                <div className={styles.newCardName}>{item.name}</div>
                <div className={styles.newCardBottom}>
                  <div className={styles.newCardPrice}>{item.price}</div>
                  {item.stars}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.sectionWrap}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Тренди</span>
            <span className={styles.sectionAll} onClick={() => navigate('/all-products')} style={{ cursor: 'pointer' }}>Дивитись усі →</span>
          </div>
          <div className={styles.smallCards}>
            {[
              { img: smallThermos, name: 'Термос харчовий 1л',    price: '410 ₴',   id: 7  },
              { img: smallCharger, name: 'Зарядна станція',        price: '1 190 ₴', id: 8  },
              { img: smallBlanket, name: 'Плед плюшевий 150×200', price: '750 ₴',   id: 9  },
              { img: smallLamp,    name: 'LED-лампа',              price: '290 ₴',   id: 10 },
            ].map((item) => (
              <div key={item.name} className={styles.smallCard} onClick={() => goToProduct(item.id)} style={{cursor:'pointer'}}>
                <img src={item.img} alt={item.name} className={styles.smallCardImg} />
                <div className={styles.smallCardName}>{item.name}</div>
                <div className={styles.smallCardPrice}>{item.price}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.bottomBannerWrap}>
          <div className={styles.bottomBanner}>
            <div className={styles.newsletter}>
              <div className={styles.newsletterInner}>
                <img src={mailIcon} alt="" className={styles.newsletterMailIcon} />
                <div className={styles.newsletterRight}>
                  <div className={styles.newsletterTitle}>Підпишись на розсилку і отримуйте знижку 5%</div>
                  <div className={styles.newsletterForm}>
                    <input className={styles.newsletterInput} type="email" placeholder="Ваш e-mail" />
                    <button className={styles.newsletterBtn}>Підписатися</button>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.stats}>
              <div className={styles.statItem}>
                <img src={moneyBag} alt="" className={styles.statIcon} />
                <div className={styles.statText}>
                  <span className={styles.statNum}>10 000 +</span>
                  <span className={styles.statLabel}>товарів онлайн</span>
                </div>
              </div>
              <div className={styles.statItem}>
                <img src={feedbackIcon} alt="" className={styles.statIconSm} />
                <div className={styles.statText}>
                  <span className={styles.statNum}>95 %</span>
                  <span className={styles.statLabel}>позитивних відгуків</span>
                </div>
              </div>
              <div className={styles.statItem}>
                <img src={headphoneFoot} alt="" className={styles.statIcon} />
                <div className={styles.statText}>
                  <span className={styles.statNum}>24/7</span>
                  <span className={styles.statLabel}>підтримка</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className={styles.footer}>
          <div className={styles.footerTop}>
            <div className={styles.footerLogo}>
              <img src={logoImg} alt="BlitzMall" className={styles.footerLogoImg} />
            </div>

            <div className={styles.footerLinks}>
              <div className={styles.footerLinkGroup}>
                <span className={styles.footerLinkTitle}>Покупцям</span>
                <div className={styles.footerLinkList}>
                  <span className={styles.footerLink}>Доставка і оплата</span>
                  <span className={styles.footerLink}>Гарантія та повернення</span>
                  <span className={styles.footerLink}>Питання та відповіді</span>
                </div>
              </div>
              <div className={styles.footerLinkGroup}>
                <span className={styles.footerLinkTitle}>Про нас</span>
                <div className={styles.footerLinkList}>
                  <span className={styles.footerLink}>Про компанію</span>
                  <span className={styles.footerLink}>Контакти</span>
                  <span className={styles.footerLink}>Блог</span>
                </div>
              </div>
              <div className={styles.footerLinkGroup}>
                <span className={styles.footerLinkTitle}>Допомога</span>
                <div className={styles.footerLinkList}>
                  <span className={styles.footerLink}>Підтримка 24/7</span>
                  <span className={styles.footerLink}>Умови користування</span>
                  <span className={styles.footerLink}>Політика конфіденційності</span>
                </div>
              </div>
            </div>

            <div className={styles.footerSocial}>
              <span className={styles.socialTitle}>Ми в соцмережах</span>
              <div className={styles.socialIcons}>
                <button className={styles.socialBtn} aria-label="Instagram">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="24" height="24" rx="5.5" fill="#323f37"/>
                    <rect x="5" y="5" width="14" height="14" rx="4" stroke="white" strokeWidth="1.5" fill="none"/>
                    <circle cx="12" cy="12" r="3.5" stroke="white" strokeWidth="1.5" fill="none"/>
                    <circle cx="16.5" cy="7.5" r="1" fill="white"/>
                  </svg>
                </button>
                <button className={styles.socialBtn} aria-label="Facebook">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="24" height="24" rx="5.5" fill="#323f37"/>
                    <path d="M15.5 4H13A4 4 0 0 0 9 8v2H7v3h2v7h3v-7h2.5l.5-3H12V8a1 1 0 0 1 1-1h2.5V4z" fill="white"/>
                  </svg>
                </button>
                <button className={styles.socialBtn} aria-label="Telegram">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="12" fill="#323f37"/>
                    <path d="M17.5 7.5 5 12l5 1.5L11.5 18l2.5-3 3.5 2.5L17.5 7.5z" fill="white"/>
                    <path d="M10 13.5 9.5 17l2-2" fill="white"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#323f37" strokeWidth="1.5"/>
              <path d="M15 9.5A4 4 0 1 0 15 14.5" stroke="#323f37" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className={styles.copyright}>2026 BlitzMall</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
