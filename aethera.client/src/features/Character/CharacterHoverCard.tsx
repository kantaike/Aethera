import styles from "./Character.module.css"
import { type CharacterDetail } from "../../api/types/types";

export const CharacterHoverCard = ({ char }: { char: CharacterDetail }) => (
  <div className={styles.hoverCard}>
    <h4 className={styles.name}>{char.name}</h4>
    <div className={styles.statsGrid}>
       <div>STR: 12</div>
       <div>DEX: 15</div>
    </div>
  </div>
);