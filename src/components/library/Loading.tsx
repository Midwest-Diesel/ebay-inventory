

interface Props {
  size?: number
}


export default function Loading({ size = 50 }: Props) {
  return <center><img style={{ userSelect: 'none' }} className="loading" src="/images/loading/loading-spinner.svg" alt="Loading" width={size} height={size} /></center>;
}
