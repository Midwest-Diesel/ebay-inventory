import { useEffect, useState } from "react";
import { invoke } from "@/scripts/config/tauri";
import { Button, Checkbox, Dialog, Loading } from "@midwest-diesel/mwd-ui";

interface Picture {
  url: string
  name: string
}

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  pictures: Picture[]
  stockNum: string
  items: AddOnItem[]
  onSave: (pictures: string[], stockNum: string) => void
}


export default function PicturesDialog({ open, setOpen, pictures, stockNum, items, onSave }: Props) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const DIRECTORY = `\\\\MWD1-SERVER\\Server\\Pictures\\sn_specific\\${stockNum}`;

  useEffect(() => {
    if (!open) return;
    const item = items.find((i) => i.stockNum === stockNum);
    setSelectedImages(item?.localImages ?? []);
  }, [open, stockNum]);

  const editSelectedImages = (checked: boolean, name: string) => {
    if (checked) { 
      setSelectedImages([...selectedImages, name]);
    } else {
      setSelectedImages(selectedImages.filter((pic) => pic !== name));
    }
  };

  const openFolder = async () => {
    await invoke('view_file', { filepath: DIRECTORY });
  };

  const onClickSave = () => {
    onSave(selectedImages, stockNum);
    setOpen(false);
  };
  

  return (
    <Dialog
      open={open}
      setOpen={setOpen}
      title="Pictures"
      width={650}
      height={520}
      y={-250}
      x={-250}
      className="pictures-dialog"
    >
      <div className="pictures-dialog__buttons">
        <Button onClick={openFolder}>Open Folder</Button>
        <Button onClick={onClickSave}>Save</Button>
      </div>

      { pictures.length === 0 && <Loading /> }

      <div className="dialog__content">
        {pictures.map((pic: Picture, i) => {
          return (
            <div key={i} className="pictures-dialog__img-container">
              <img
                src={`data:image/png;base64,${pic.url}`}
                alt={pic.name}
                width={240}
                height={240}
              />

              <Checkbox
                variant={['label-fit', 'dark-bg']}
                checked={selectedImages.includes(pic.name)}
                onChange={(e) => editSelectedImages(e.target.checked, pic.name)}
              />
            </div>
          );
        })}
      </div>
    </Dialog>
  );
}
