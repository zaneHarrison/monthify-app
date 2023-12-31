import styles from "../styles/ButtonStyles.module.css";
import localFont from "next/font/local";

const bold = localFont({
  src: "../../../fonts/Spotify-Font/Gotham-Bold.otf",
});

export function SignUpButton() {
  return (
    <div id="sign-up-button">
      <button className={styles.signUpButton} type="button">
        <p className={bold.className}>Get Started With Monthify</p>
      </button>
    </div>
  );
}
