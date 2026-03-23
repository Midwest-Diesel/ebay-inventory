import { invoke } from "@/scripts/config/tauri";
import { Button, Modal } from "@midwest-diesel/mwd-ui";

interface Props {
  open: boolean
  notes: string
}


export default function UpdateModal({ open, notes }: Props) {
  const handleUpdate = () => {
    invoke('install_update');
  };
  

  return (
    <>
      {open && localStorage.getItem('showUpdate') !== 'false' &&
        <Modal
          open
          title="Update Available"
          style={{ maxWidth: '18rem' }}
          closeOnOutsideClick={false}
          exitWithEsc={false}
          showCloseBtn={false}
        >
          <div className="form__footer">
            <Button onClick={handleUpdate}>Install and restart</Button>
          </div>

          {notes &&
            <div style={{ marginTop: '1rem', textAlign: 'start' }}>
              <h6>Notable Changes</h6>
              <p>{ notes }</p>
            </div>
          }
        </Modal>
      }
    </>
  );
}
