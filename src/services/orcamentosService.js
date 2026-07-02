import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, isFirebaseConfigured, storage } from '../firebase';
import { supabase, isSupabaseConfigured } from '../supabase';

const ORCAMENTOS_COLLECTION = 'orcamentos';

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
      console.error('Falha ao salvar orçamento no Supabase:', supabaseError);
      return {
        saved: false,
        reason: 'supabase-error',
        error: supabaseError.message
      };
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
      console.error('Falha ao salvar orçamento no Firebase:', firebaseError);
      return {
        saved: false,
        reason: 'firebase-error',
        error: firebaseError.message
      };
    }
  }

  return {
    saved: false,
    reason: 'no-database-configured',
  };
};
