import { useMemo } from "react";
import type { AdministrativeUnit, Settlement } from "../api/types/types";
import { SettlementCard } from "../features/Settlements/SettlementCard/SettlementCard";
import { useSettlements } from "../hooks/useSettlements";
import styles from './Styles/SettlementsPage.module.css';
import { useAdministrativeUnits } from "../hooks/useAdministrativeUnits";
import { FantasyLoader } from "../components/Loader/FantasyLoader";

export function SettlementsPage() {
  const { data: settlements, isLoading: sLoading } = useSettlements();
  const { data: units, isLoading: uLoading } = useAdministrativeUnits();

  const organizedSettlements = useMemo(() => {
    if (!settlements || !units) return new Map();

    const map = new Map<string, Map<string, Settlement[]>>();

    // Создаем быстрый поиск по ID для админ. юнитов
    const unitsMap = new Map<string, AdministrativeUnit>(units.map((u: AdministrativeUnit) => [u.id, u]));

    settlements.forEach((s: Settlement) => {
      const province = unitsMap.get(s.provinceId ?? '');
      const region = province ? unitsMap.get(province.parentId!) : null;
      const country = region ? unitsMap.get(region.parentId!) : null;

      const countryName = country?.title || "Independent Territories";
      const regionName = region?.title || "Local Areas";

      if (!map.has(countryName)) {
        map.set(countryName, new Map());
      }
      
      const countryMap = map.get(countryName)!;
      if (!countryMap.has(regionName)) {
        countryMap.set(regionName, []);
      }

      countryMap.get(regionName)!.push(s);
    });

    return map;
  }, [settlements, units]);

  if (sLoading || uLoading) {
    return <FantasyLoader fullScreen></FantasyLoader>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.mainTitle}>World Settlements</h1>
      
      {Array.from(organizedSettlements).map(([country, regions]) => (
        <section key={country} className={styles.countrySection}>
          <div className={styles.countryHeader}>
            <h2 className={styles.countryName}>{country}</h2>
            <div className={styles.goldLine} />
          </div>

          {Array.from(regions as Map<string, Settlement[]>).map(([region, settlementsList]: [string, Settlement[]]) => (
            <div key={region} className={styles.regionBlock}>
              <h3 className={styles.regionName}>
                <span className={styles.diamond}>◈</span> {region}
              </h3>
              <div className={styles.settlementsGrid}>
                {settlementsList.map((s: Settlement) => (
                  <SettlementCard key={s.id} {...s} />
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}