import { useState } from "react";
import { useDispatch } from "react-redux";
import { setCustomGroups } from "@/store/group";
import { Input, Modal } from "antd";
import styles from "./style.module.css";
import { Group } from "@/modules/Group";

export default function CreateGroupModal() {
  const [open, setOpen] = useState<boolean>(false);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");
  const dispatch = useDispatch();

  const handleOk = async () => {
    if (btnLoading) {
      return;
    }

    try {
      setBtnLoading(true);

      await Group.createGroup({
        name: value,
      });

      const { results: groups } = await Group.getCustomGroups();
      dispatch(setCustomGroups(groups));

      setBtnLoading(false);
    } catch (err) {
      setBtnLoading(false);
    }

    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <div className={styles.addTagButton} onClick={() => setOpen(true)}>
        <div className={styles.addTagIcon}>+</div>
      </div>
      <Modal
        title="Create Tag"
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonProps={{
          loading: btnLoading,
          disabled: btnLoading,
        }}
      >
        <Input
          placeholder="New Tag"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />
      </Modal>
    </>
  );
}
