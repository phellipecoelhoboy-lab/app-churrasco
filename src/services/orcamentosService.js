import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, isFirebaseConfigured, storage } from '../firebase';

const ORCAMENTOS_COLLECTION = 'orcamentos';

export const saveOrcamentoWithPdf = async ({
  budgetData,
  pdfFile,
  fileName,
}) => {
  if (!isFirebaseConfigured || !db || !storage) {
    return {
      saved: false,
      reason: 'firebase-not-configured',
    };
  }

  const createdAt = Date.now();

  const orcamentoRef = await addDoc(collection(db, ORCAMENTOS_COLLECTION), {
    ...budgetData,
    status: 'novo',
    pdfFileName: fileName,
    pdfUrl: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdAtUnix: createdAt,
  });

  const pdfRef = ref(storage, `orcamentos-pdf/${orcamentoRef.id}/${fileName}`);
  await uploadBytes(pdfRef, pdfFile, {
    contentType: 'application/pdf',
  });

  const pdfUrl = await getDownloadURL(pdfRef);

  await updateDoc(doc(db, ORCAMENTOS_COLLECTION, orcamentoRef.id), {
    pdfUrl,
    updatedAt: serverTimestamp(),
  });

  return {
    saved: true,
    orcamentoId: orcamentoRef.id,
    pdfUrl,
  };
};
