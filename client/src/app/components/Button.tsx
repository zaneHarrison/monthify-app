import styles from "../styles/ButtonStyles.module.css";
import localFont from "next/font/local";

const bold = localFont({
  src: "../../../fonts/Spotify-Font/Gotham-Bold.otf",
});

interface Props {
  className: string;
  text: string;
}

const SignUpButton: React.FC<Props> = ({ className, text }) => {
  return (
    <div id="sign-up-button">
      <button className={styles[className]} type="button">
        <p className={bold.className}>{text}</p>
      </button>
    </div>
  );
};

export default SignUpButton;
