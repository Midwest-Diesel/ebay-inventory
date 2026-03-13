import parser from "html-react-parser";

interface Props {
  msg: string
  type: 'error' | 'success' | 'warning' | 'none'
}


export default function Toast({ msg, type }: Props) {
  return (
    <div className="toast">
      { type !== 'none' && <object data={`/images/notifications/${type}.svg`} className={`toast__icon--${type}`} width={65} height={65}></object> }
      <p>{ parser(msg) }</p>
    </div>
  );
}
