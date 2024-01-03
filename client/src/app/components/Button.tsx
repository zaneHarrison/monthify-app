import styles from "../styles/ButtonStyles.module.css";
import localFont from "next/font/local";
import Link from "next/link";

const bold = localFont({
  src: "../../../fonts/Spotify-Font/Gotham-Bold.otf",
});

interface Props {
  className: string;
  text: string;
  link: string;
  target: string;
}

const Button: React.FC<Props> = ({ target, className, text, link }) => {
  return (
    <div id="sign-up-button">
      <Link target={target} href={link} className={styles.buttonWrapper}>
        <button className={styles[className]} type="button">
          <p className={bold.className}>{text}</p>
        </button>
      </Link>
    </div>
  );
};

export default Button;
