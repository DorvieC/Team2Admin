import { useState, useEffect, useRef, useCallback } from 'react';
import { novaPoshtaApi } from '../../api/novaPoshta';
import type { NpCity, NpWarehouse } from '../../api/novaPoshta';
import styles from './DeliverySelector.module.css';

export type CarrierType = 'nova-poshta' | 'ukrposhta' | 'courier';

export interface DeliveryValue {
  carrier: CarrierType;
  cityName: string;
  cityRef: string;
  warehouseDescription: string;
  manualAddress: string;
}

interface DeliverySelectorProps {
  value: DeliveryValue;
  onChange: (value: DeliveryValue) => void;
  errors?: { city?: string; warehouse?: string; address?: string };
}

const CARRIERS: { id: CarrierType; label: string; icon: string }[] = [
  { id: 'nova-poshta', label: 'Нова Пошта', icon: '📦' },
  { id: 'ukrposhta', label: 'Укрпошта', icon: '📮' },
  { id: 'courier', label: "Кур'єр", icon: '🚗' },
];

export default function DeliverySelector({ value, onChange, errors }: DeliverySelectorProps) {
  const [cityQuery, setCityQuery] = useState(value.cityName);
  const [cityResults, setCityResults] = useState<NpCity[]>([]);
  const [cityOpen, setCityOpen] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);

  const [warehouseQuery, setWarehouseQuery] = useState(value.warehouseDescription);
  const [warehouseResults, setWarehouseResults] = useState<NpWarehouse[]>([]);
  const [warehouseOpen, setWarehouseOpen] = useState(false);
  const [warehouseLoading, setWarehouseLoading] = useState(false);

  const cityBoxRef = useRef<HTMLDivElement>(null);
  const warehouseBoxRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (cityBoxRef.current && !cityBoxRef.current.contains(e.target as Node)) setCityOpen(false);
      if (warehouseBoxRef.current && !warehouseBoxRef.current.contains(e.target as Node)) setWarehouseOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const setCarrier = (carrier: CarrierType) => {
    onChange({ carrier, cityName: '', cityRef: '', warehouseDescription: '', manualAddress: '' });
    setCityQuery('');
    setWarehouseQuery('');
    setCityResults([]);
    setWarehouseResults([]);
  };

  const handleCityInput = useCallback((text: string) => {
    setCityQuery(text);
    onChange({ ...value, cityName: text, cityRef: '', warehouseDescription: '' });
    setWarehouseQuery('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < 2) { setCityResults([]); return; }
    setCityLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await novaPoshtaApi.searchCities(text);
        setCityResults(results);
        setCityOpen(true);
      } catch {
        setCityResults([]);
      } finally {
        setCityLoading(false);
      }
    }, 350);
  }, [value, onChange]);

  const handleSelectCity = (city: NpCity) => {
    setCityQuery(city.name);
    setCityOpen(false);
    onChange({ ...value, cityName: city.name, cityRef: city.deliveryCityRef, warehouseDescription: '' });
  };

  const handleWarehouseInput = useCallback((text: string) => {
    setWarehouseQuery(text);
    onChange({ ...value, warehouseDescription: text });
    if (!value.cityRef) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setWarehouseLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await novaPoshtaApi.getWarehouses(value.cityRef, text);
        setWarehouseResults(results.slice(0, 30));
        setWarehouseOpen(true);
      } catch {
        setWarehouseResults([]);
      } finally {
        setWarehouseLoading(false);
      }
    }, 300);
  }, [value, onChange]);

  const handleWarehouseFocus = async () => {
    if (!value.cityRef) return;
    setWarehouseOpen(true);
    if (warehouseResults.length === 0) {
      setWarehouseLoading(true);
      try {
        const results = await novaPoshtaApi.getWarehouses(value.cityRef, warehouseQuery);
        setWarehouseResults(results.slice(0, 30));
      } catch {
        setWarehouseResults([]);
      } finally {
        setWarehouseLoading(false);
      }
    }
  };

  const handleSelectWarehouse = (w: NpWarehouse) => {
    setWarehouseQuery(w.description);
    setWarehouseOpen(false);
    onChange({ ...value, warehouseDescription: w.description });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.carrierRow}>
        {CARRIERS.map(c => (
          <button
            key={c.id}
            type="button"
            className={`${styles.carrierBtn} ${value.carrier === c.id ? styles.carrierActive : ''}`}
            onClick={() => setCarrier(c.id)}
          >
            <span className={styles.carrierIcon}>{c.icon}</span>
            {c.label}
          </button>
        ))}
      </div>

      {value.carrier === 'nova-poshta' && (
        <>
          <div className={styles.field} ref={cityBoxRef}>
            <label className={styles.label}>Місто</label>
            <input
              className={`${styles.input} ${errors?.city ? styles.inputErr : ''}`}
              placeholder="Почніть вводити назву міста..."
              value={cityQuery}
              onChange={e => handleCityInput(e.target.value)}
              onFocus={() => cityResults.length > 0 && setCityOpen(true)}
            />
            {cityLoading && <span className={styles.spinner} />}
            {cityOpen && cityResults.length > 0 && (
              <div className={styles.dropdown}>
                {cityResults.map(city => (
                  <div key={city.ref} className={styles.dropdownItem} onClick={() => handleSelectCity(city)}>
                    {city.name} <span className={styles.dropdownArea}>{city.area}</span>
                  </div>
                ))}
              </div>
            )}
            {errors?.city && <span className={styles.err}>{errors.city}</span>}
          </div>

          <div className={styles.field} ref={warehouseBoxRef}>
            <label className={styles.label}>Відділення Нової Пошти</label>
            <input
              className={`${styles.input} ${errors?.warehouse ? styles.inputErr : ''}`}
              placeholder={value.cityRef ? 'Оберіть або знайдіть відділення...' : 'Спочатку оберіть місто'}
              value={warehouseQuery}
              disabled={!value.cityRef}
              onChange={e => handleWarehouseInput(e.target.value)}
              onFocus={handleWarehouseFocus}
            />
            {warehouseLoading && <span className={styles.spinner} />}
            {warehouseOpen && warehouseResults.length > 0 && (
              <div className={styles.dropdown}>
                {warehouseResults.map(w => (
                  <div key={w.ref} className={styles.dropdownItem} onClick={() => handleSelectWarehouse(w)}>
                    {w.description}
                  </div>
                ))}
              </div>
            )}
            {errors?.warehouse && <span className={styles.err}>{errors.warehouse}</span>}
          </div>
        </>
      )}

      {value.carrier === 'ukrposhta' && (
        <>
          <div className={styles.note}>
            ℹ️ Укрпошта не надає публічного API для автопідбору відділень — вкажіть адресу відділення вручну.
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Місто</label>
            <input
              className={`${styles.input} ${errors?.city ? styles.inputErr : ''}`}
              placeholder="Ваше місто"
              value={value.cityName}
              onChange={e => onChange({ ...value, cityName: e.target.value })}
            />
            {errors?.city && <span className={styles.err}>{errors.city}</span>}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Адреса відділення Укрпошти</label>
            <input
              className={`${styles.input} ${errors?.warehouse ? styles.inputErr : ''}`}
              placeholder="напр. Відділення №5, вул. Соборна, 10"
              value={value.warehouseDescription}
              onChange={e => onChange({ ...value, warehouseDescription: e.target.value })}
            />
            {errors?.warehouse && <span className={styles.err}>{errors.warehouse}</span>}
          </div>
        </>
      )}

      {value.carrier === 'courier' && (
        <>
          <div className={styles.field}>
            <label className={styles.label}>Місто</label>
            <input
              className={`${styles.input} ${errors?.city ? styles.inputErr : ''}`}
              placeholder="Ваше місто"
              value={value.cityName}
              onChange={e => onChange({ ...value, cityName: e.target.value })}
            />
            {errors?.city && <span className={styles.err}>{errors.city}</span>}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Адреса доставки</label>
            <input
              className={`${styles.input} ${errors?.address ? styles.inputErr : ''}`}
              placeholder="вул. Хрещатик, 1, кв. 5"
              value={value.manualAddress}
              onChange={e => onChange({ ...value, manualAddress: e.target.value })}
            />
            {errors?.address && <span className={styles.err}>{errors.address}</span>}
          </div>
        </>
      )}
    </div>
  );
}
