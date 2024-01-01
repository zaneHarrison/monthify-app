import styles from "../styles/ButtonStyles.module.css";
import localFont from "next/font/local";

const bold = localFont({
  src: "../../../fonts/Spotify-Font/Gotham-Bold.otf",
});

interface Props {
  className: string;
  text: string;
  link: string;
}

const SignUpButton: React.FC<Props> = ({ className, text, link }) => {
  return (
    <div id="sign-up-button">
      <a target="_blank" href={link} className={styles.buttonWrapper}>
        <button className={styles[className]} type="button">
          <p className={bold.className}>{text}</p>
        </button>
      </a>
    </div>
  );
};

export default SignUpButton;
