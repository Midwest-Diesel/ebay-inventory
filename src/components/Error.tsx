interface Props {
  msg: string
  darkBg?: boolean
}


export default function Error({ msg, darkBg = false }: Props) {
  return (
    <>
      {msg &&
        <div className="error" style={ darkBg ? { backgroundColor: 'var(--grey-dark-2)' } : {}}>
          <p>{ msg }</p>
        </div>
      }
    </>
  );
};
