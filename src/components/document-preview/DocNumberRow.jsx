export default function DocNumberRow({ reqNo = "", date = "" }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontSize: "13px", color: "#000", paddingLeft: 16, paddingRight: 8 }}>
            <span style={{ marginLeft: 145 }}>ຝ່າຍໃດໜຶ່ງ</span>
            <div style={{ textAlign: "right", marginRight: 50 }}>
                <p>ເລກທີ:{reqNo || "ອກ"}</p>
                <p>ນະຄອນຫຼວງວຽງຈັນ, ວັນທີ:{date}</p>
            </div>
        </div>
    );
}
