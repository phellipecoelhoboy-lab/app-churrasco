import { addDoc, collection, doc, serverTimestamp, updateDoc, getDocs, query, orderBy, deleteDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { db, isFirebaseConfigured, storage } from '../firebase';
import { supabase, isSupabaseConfigured } from '../supabase';

const ORCAMENTOS_COLLECTION = 'orcamentos';

// ----------------------------------------------------
// INDEXEDDB LOCAL FALLBACKS
// ----------------------------------------------------
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AppChurrascoDB', 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('orcamentos')) {
        db.createObjectStore('orcamentos', { keyPath: 'id' });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

const saveLocalOrcamento = async (orcamento) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['orcamentos'], 'readwrite');
    const store = transaction.objectStore('orcamentos');
    const request = store.put(orcamento);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const getLocalOrcamentos = async () => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['orcamentos'], 'readonly');
      const store = transaction.objectStore('orcamentos');
      const request = store.getAll();
      request.onsuccess = () => {
        const sorted = (request.result || []).sort((a, b) => b.createdAtUnix - a.createdAtUnix);
        resolve(sorted);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('IndexedDB get error:', err);
    return [];
  }
};

const deleteLocalOrcamento = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['orcamentos'], 'readwrite');
    const store = transaction.objectStore('orcamentos');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// ----------------------------------------------------
// SAVE BUDGET WITH PDF
// ----------------------------------------------------
export const saveOrcamentoWithPdf = async ({
  budgetData,
  pdfFile,
  fileName,
}) => {
  const createdAt = Date.now();

  // 1. Try Supabase if configured
  if (isSupabaseConfigured) {
    try {
      // Insert metadata into table 'orcamentos'
      const { data: insertedRows, error: dbError } = await supabase
        .from('orcamentos')
        .insert([
          {
            cliente_nome: budgetData.clienteNome,
            cliente_whatsapp: budgetData.clienteWhatsapp,
            num_pessoas: budgetData.numPessoas,
            data_evento: budgetData.dataEvento,
            horario_evento: budgetData.horarioEvento,
            local_evento: budgetData.localEvento,
            layout_pdf: budgetData.layoutPdf,
            status: 'novo',
            pdf_file_name: fileName,
            pdf_url: null,
            created_at_unix: createdAt,
            detalhes: {
              churrasco: budgetData.churrasco,
              carnesCustomizadas: budgetData.carnesCustomizadas,
              acompanhamentosCustomizados: budgetData.acompanhamentosCustomizados,
              bebidas: budgetData.bebidas,
              extras: budgetData.extras,
              totals: budgetData.totals,
            }
          }
        ])
        .select();

      if (dbError) throw dbError;
      if (!insertedRows || insertedRows.length === 0) {
        throw new Error('Supabase insert succeeded but returned no rows.');
      }
      
      const budgetRecord = insertedRows[0];
      const budgetId = budgetRecord.id;

      // Upload PDF to Supabase Storage (bucket: 'orcamentos-pdf')
      const filePath = `orcamentos-pdf/${budgetId}/${fileName}`;
      const { error: storageError } = await supabase.storage
        .from('orcamentos-pdf')
        .upload(filePath, pdfFile, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (storageError) throw storageError;

      // Get Public URL for the uploaded PDF
      const { data: urlData } = supabase.storage
        .from('orcamentos-pdf')
        .getPublicUrl(filePath);

      const pdfUrl = urlData.publicUrl;

      // Update budget row with the PDF URL
      const { error: updateError } = await supabase
        .from('orcamentos')
        .update({ pdf_url: pdfUrl })
        .eq('id', budgetId);

      if (updateError) throw updateError;

      return {
        saved: true,
        orcamentoId: String(budgetId),
        pdfUrl,
      };
    } catch (supabaseError) {
      console.error('Falha ao salvar orçamento no Supabase, tentando local:', supabaseError);
    }
  }

  // 2. Fallback to Firebase if configured
  if (isFirebaseConfigured && db && storage) {
    try {
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
    } catch (firebaseError) {
      console.error('Falha ao salvar orçamento no Firebase, tentando local:', firebaseError);
    }
  }

  // 3. Save to local IndexedDB (fallback for local development or database failures)
  try {
    const orcamentoId = `local-${Date.now()}`;
    const reader = new FileReader();
    const base64Promise = new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(pdfFile);
    });
    const pdfBase64 = await base64Promise;

    const localRecord = {
      id: orcamentoId,
      clienteNome: budgetData.clienteNome,
      clienteWhatsapp: budgetData.clienteWhatsapp,
      numPessoas: budgetData.numPessoas,
      dataEvento: budgetData.dataEvento,
      horarioEvento: budgetData.horarioEvento,
      localEvento: budgetData.localEvento,
      layoutPdf: budgetData.layoutPdf,
      status: 'novo',
      pdfFileName: fileName,
      pdfUrl: pdfBase64,
      createdAtUnix: createdAt,
      churrasco: budgetData.churrasco,
      carnesCustomizadas: budgetData.carnesCustomizadas,
      acompanhamentosCustomizados: budgetData.acompanhamentosCustomizados,
      bebidas: budgetData.bebidas,
      extras: budgetData.extras,
      totals: budgetData.totals,
    };

    await saveLocalOrcamento(localRecord);

    return {
      saved: true,
      orcamentoId,
      pdfUrl: pdfBase64,
      isLocal: true,
    };
  } catch (localError) {
    console.error('Falha ao salvar orçamento localmente no IndexedDB:', localError);
    return {
      saved: false,
      reason: 'database-failed-and-local-save-failed',
      error: localError.message,
    };
  }
};

// ----------------------------------------------------
// FETCH ALL BUDGETS
// ----------------------------------------------------
export const getOrcamentos = async () => {
  // 1. Try Supabase if configured
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*')
        .order('created_at_unix', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        id: String(item.id),
        clienteNome: item.cliente_nome,
        clienteWhatsapp: item.cliente_whatsapp,
        numPessoas: item.num_pessoas,
        dataEvento: item.data_evento,
        horarioEvento: item.horario_evento,
        localEvento: item.local_evento,
        layoutPdf: item.layout_pdf,
        status: item.status,
        pdfFileName: item.pdf_file_name,
        pdfUrl: item.pdf_url,
        createdAtUnix: item.created_at_unix,
        churrasco: item.detalhes?.churrasco,
        carnesCustomizadas: item.detalhes?.carnesCustomizadas,
        acompanhamentosCustomizados: item.detalhes?.acompanhamentosCustomizados,
        bebidas: item.detalhes?.bebidas,
        extras: item.detalhes?.extras,
        totals: item.detalhes?.totals,
      }));
    } catch (supabaseError) {
      console.error('Falha ao buscar orçamentos no Supabase, tentando local:', supabaseError);
    }
  }

  // 2. Try Firebase if configured
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, ORCAMENTOS_COLLECTION), orderBy('createdAtUnix', 'desc'));
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        const d = doc.data();
        list.push({
          id: doc.id,
          clienteNome: d.clienteNome,
          clienteWhatsapp: d.clienteWhatsapp,
          numPessoas: d.numPessoas,
          dataEvento: d.dataEvento,
          horarioEvento: d.horarioEvento,
          localEvento: d.localEvento,
          layoutPdf: d.layoutPdf,
          status: d.status,
          pdfFileName: d.pdfFileName,
          pdfUrl: d.pdfUrl,
          createdAtUnix: d.createdAtUnix,
          churrasco: d.churrasco,
          carnesCustomizadas: d.carnesCustomizadas,
          acompanhamentosCustomizados: d.acompanhamentosCustomizados,
          bebidas: d.bebidas,
          extras: d.extras,
          totals: d.totals,
        });
      });
      return list;
    } catch (firebaseError) {
      console.error('Falha ao buscar orçamentos no Firebase, tentando local:', firebaseError);
    }
  }

  // 3. Fallback to local IndexedDB
  return await getLocalOrcamentos();
};

// ----------------------------------------------------
// DELETE A BUDGET
// ----------------------------------------------------
export const deleteOrcamento = async (id, pdfFileName) => {
  // If it's a local/IndexedDB ID, delete it locally
  if (String(id).startsWith('local-')) {
    try {
      await deleteLocalOrcamento(id);
      return { success: true };
    } catch (localError) {
      console.error('Falha ao deletar orçamento localmente:', localError);
      return { success: false, error: localError.message };
    }
  }

  // 1. Try Supabase if configured
  if (isSupabaseConfigured) {
    try {
      // Delete metadata
      const { error: dbError } = await supabase
        .from('orcamentos')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // Delete storage PDF if configured
      if (pdfFileName) {
        const filePath = `orcamentos-pdf/${id}/${pdfFileName}`;
        try {
          await supabase.storage
            .from('orcamentos-pdf')
            .remove([filePath]);
        } catch (storageErr) {
          console.warn('Erro ao remover PDF do Supabase Storage:', storageErr);
        }
      }

      return { success: true };
    } catch (supabaseError) {
      console.error('Falha ao deletar orçamento no Supabase:', supabaseError);
      return { success: false, error: supabaseError.message };
    }
  }

  // 2. Try Firebase if configured
  if (isFirebaseConfigured && db) {
    try {
      // Delete document
      await deleteDoc(doc(db, ORCAMENTOS_COLLECTION, id));

      // Delete storage PDF
      if (pdfFileName && storage) {
        const pdfRef = ref(storage, `orcamentos-pdf/${id}/${pdfFileName}`);
        try {
          await deleteObject(pdfRef);
        } catch (storageErr) {
          console.warn('Erro ao remover PDF do Firebase Storage:', storageErr);
        }
      }

      return { success: true };
    } catch (firebaseError) {
      console.error('Falha ao deletar orçamento no Firebase:', firebaseError);
      return { success: false, error: firebaseError.message };
    }
  }

  // Fallback (e.g. if ID is not marked local but both remote databases are down/unset)
  try {
    await deleteLocalOrcamento(id);
    return { success: true };
  } catch (localError) {
    console.error('Falha ao deletar orçamento no fallback:', localError);
    return { success: false, error: localError.message };
  }
};
