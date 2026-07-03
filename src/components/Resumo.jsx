import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { saveOrcamentoWithPdf } from '../services/orcamentosService';

const Resumo = ({
  numPessoas,
  clienteNome,
  clienteWhatsapp,
  churrasco,
  carnesCustomizadas,
  acompanhamentosCustomizados,
  bebidas,
  extras,
  beverageCatalog,
}) => {
  const [local, setLocal] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [horario, setHorario] = useState('');
  const [isSending, setIsSending] = useState(false);
  const pdfLayout = 'elegante';

  const todayISO = new Date().toISOString().split('T')[0];
  const WHATSAPP_NUMBER = '556282191226';

  const getBebidaPrice = (beb) => {
    if (beb?.price !== undefined && beb?.price !== null && beb?.price !== '') {
      return Number(beb.price) || 0;
    }

    const categoryPrice = beverageCatalog?.find((item) => item.id === beb?.categoryId)?.price;
    return Number(categoryPrice) || 0;
  };

  const calcularTotal = () => {
    let total = 0;

    if (churrasco) {
      total += churrasco.price * numPessoas;
    }

    // Extras não possuem preço associado
    // extras.forEach((extra) => {
    //   total += extra.price;
    // });

    return total;
  };

  const isEventDateValid = () => data >= todayISO;

  const isValidBudget = () => (
    numPessoas > 0
    && churrasco
    && bebidas.length > 0
    && local
    && horario
    && data
    && isEventDateValid()
  );

  const sanitizeFileName = (value) => (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();

  const triggerPdfDownload = (file, fileName) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generatePdf = async () => {
    const resumoElement = document.getElementById('resumo');
    if (!resumoElement) {
      throw new Error('Resumo não encontrado para gerar PDF.');
    }

    const canvas = await html2canvas(resumoElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imageData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const printableWidth = pageWidth - (margin * 2);
    const printableHeight = pageHeight - (margin * 2);

    let displayWidth = printableWidth;
    let displayHeight = (canvas.height * printableWidth) / canvas.width;

    // Se a altura calculada do orçamento ultrapassar a altura útil da folha A4,
    // reduzimos proporcionalmente para caber inteiro em uma única folha.
    if (displayHeight > printableHeight) {
      displayHeight = printableHeight;
      displayWidth = (canvas.width * printableHeight) / canvas.height;
    }

    // Centraliza horizontalmente na folha A4
    const xPos = margin + (printableWidth - displayWidth) / 2;

    pdf.addImage(imageData, 'PNG', xPos, margin, displayWidth, displayHeight);

    const nomeSlug = sanitizeFileName(clienteNome) || 'cliente';
    const fileName = `orcamento_${nomeSlug}_${data}_${pdfLayout}.pdf`;
    const blob = pdf.output('blob');
    const file = new File([blob], fileName, { type: 'application/pdf' });

    return { file, fileName };
  };

  const gerarMensagemWhatsApp = async () => {
    if (!isEventDateValid()) {
      alert('⚠️ A data do evento não pode ser anterior ao dia atual.');
      return;
    }

    if (!isValidBudget()) {
      alert('⚠️ Por favor, preencha todos os campos:\n- Data do evento\n- Horário\n- Local do evento');
      return;
    }

    setIsSending(true);

    try {
      const { file, fileName } = await generatePdf();

      let savedOrcamentoMeta = null;

      const totalChurrascoValor = churrasco ? churrasco.price * numPessoas : 0;
      const totalBebidasValor = 0;
      const totalExtrasValor = 0;
      const totalEventoValor = calcularTotal();

      try {
        savedOrcamentoMeta = await saveOrcamentoWithPdf({
          budgetData: {
            clienteNome,
            clienteWhatsapp,
            numPessoas,
            dataEvento: data,
            horarioEvento: horario,
            localEvento: local,
            layoutPdf: pdfLayout,
            churrasco,
            carnesCustomizadas,
            acompanhamentosCustomizados,
            bebidas,
            extras,
            totals: {
              churrasco: totalChurrascoValor,
              bebidas: totalBebidasValor,
              extras: totalExtrasValor,
              total: totalEventoValor,
            },
          },
          pdfFile: file,
          fileName,
        });
      } catch (saveError) {
        console.warn('Falha ao salvar orçamento:', saveError);
      }

      const dataFormatadaTexto = new Date(data).toLocaleDateString('pt-BR');
      let mensagem = '🔥 *SOLICITAÇÃO DE ORÇAMENTO DE CHURRASCO* 🍖\n\n';
      mensagem += '━━━━━━━━━━━━━━━━━━━━━\n';
      mensagem += '📋 *INFORMAÇÕES DO EVENTO*\n';
      mensagem += '━━━━━━━━━━━━━━━━━━━━━\n';
      mensagem += `🙋 Cliente: ${clienteNome}\n`;
      mensagem += `📱 WhatsApp: ${clienteWhatsapp}\n`;
      mensagem += `👥 Pessoas: ${numPessoas}\n`;
      mensagem += `📅 Data: ${dataFormatadaTexto}\n`;
      mensagem += `🕐 Horário: ${horario}\n`;
      mensagem += `📍 Local: ${local}\n\n`;

      mensagem += '━━━━━━━━━━━━━━━━━━━━━\n';
      mensagem += '🍖 *ITENS SELECIONADOS*\n';
      mensagem += '━━━━━━━━━━━━━━━━━━━━━\n\n';

      mensagem += '📍 *Pacote de Churrasco:*\n';
      mensagem += `${churrasco.name}\n`;

      const carnes = churrasco.isCustom ? carnesCustomizadas : (churrasco.meats || []);
      const acompanhamentos = churrasco.isCustom ? acompanhamentosCustomizados : (churrasco.sideDishes || []);

      if (carnes && carnes.length > 0) {
        mensagem += '\n🥩 *Carnes Inclusas:*\n';
        carnes.forEach((carne) => {
          mensagem += `• ${carne}\n`;
        });
      }

      if (acompanhamentos && acompanhamentos.length > 0) {
        mensagem += '\n🥗 *Acompanhamentos Inclusos:*\n';
        acompanhamentos.forEach((acompanhamento) => {
          mensagem += `• ${acompanhamento}\n`;
        });
      }

      mensagem += '\n🍻 *Bebidas Selecionadas:*\n';
      bebidas.forEach((beb) => {
        mensagem += `• ${beb.categoryName ? `${beb.categoryName} - ` : ''}${beb.option}\n`;
      });

      if (extras.length > 0) {
        mensagem += '✨ *SERVIÇOS ADICIONAIS:*\n';
        extras.forEach((extra) => {
          mensagem += `• ${extra.name}\n`;
        });
      }

      mensagem += '━━━━━━━━━━━━━━━━━━━━━\n';
      mensagem += '💬 *Valores a combinar com o churrasqueiro.*\n';
      mensagem += '━━━━━━━━━━━━━━━━━━━━━\n\n';
      mensagem += `📎 PDF gerado: ${fileName}\n`;
      mensagem += `🎨 Layout: ${pdfLayout === 'elegante' ? 'Elegante' : 'Vibrante'}\n`;
      if (savedOrcamentoMeta?.saved && savedOrcamentoMeta?.orcamentoId) {
        mensagem += `🗂️ Código do orçamento: ${savedOrcamentoMeta.orcamentoId}\n`;
      }
      mensagem += '✅ Gostaria de confirmar este orçamento para o meu evento!';

      const targetPhone = WHATSAPP_NUMBER;

      // 1. Garante a geração e o download do arquivo PDF na máquina do usuário
      triggerPdfDownload(file, fileName);

      // 2. Direciona a conversa do WhatsApp para o número do churrasqueiro
      const urlWhatsApp = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(mensagem)}`;
      window.location.href = urlWhatsApp;
    } catch (error) {
      console.error(error);
      alert('⚠️ Não foi possível gerar o PDF do orçamento. Tente novamente.');
    } finally {
      setIsSending(false);
    }
  };

  const dataFormatada = new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const totalChurrascoValor = churrasco ? churrasco.price * numPessoas : 0;
  const totalBebidasValor = 0;
  const totalExtrasValor = 0; // Extras não possuem custo
  const totalEventoValor = calcularTotal();
  const isElegantLayout = pdfLayout === 'elegante';

  const comidaItens = churrasco?.isCustom
    ? (carnesCustomizadas || [])
    : (churrasco?.meats || []);

  const finalizacaoItens = churrasco?.isCustom
    ? (acompanhamentosCustomizados || [])
    : (churrasco?.sideDishes || []);

  const equipeKeywords = ['garcom', 'churrasqueiro', 'cozinheiro', 'auxiliar', 'equipe'];
  const materialKeywords = ['material', 'kit', 'rechaud', 'toalha', 'travessa'];

  const equipeItens = extras
    .filter((extra) => equipeKeywords.some((term) => extra.name.toLowerCase().includes(term)));

  const materialItens = extras
    .filter((extra) => materialKeywords.some((term) => extra.name.toLowerCase().includes(term)));

  return (
    <div className="resumo-wrapper">
      <div id="resumo" className={`resumo-pdf-container pdf-layout-${pdfLayout}`}>
        {isElegantLayout ? (
          <>
            <div className="pdf-elegant-hero">
              <div className="pdf-elegant-title-wrap">
                <h2>ORCAMENTO</h2>
                <h3>{(churrasco?.name || 'CHURRASCO').toUpperCase()}</h3>
              </div>
              <div className="pdf-header-logo">
                <img src="/img/oyama-logo.png" alt="Logo" className="logo-image" />
              </div>
            </div>

            <div className="pdf-elegant-body">
              <section className="pdf-elegant-section">
                <h4>&gt; INFORMACOES GERAIS</h4>
                <ul>
                  <li>DATA: {dataFormatada}</li>
                  <li>HORARIO: {horario || 'A DEFINIR'}</li>
                  <li>LOCAL: {(local || 'A DEFINIR').toUpperCase()}</li>
                  <li>CLIENTE: {(clienteNome || 'NAO INFORMADO').toUpperCase()}</li>
                  <li>WHATSAPP: {clienteWhatsapp || 'NAO INFORMADO'}</li>
                  <li>PESSOAS: {numPessoas}</li>
                </ul>
              </section>

              <section className="pdf-elegant-section">
                <h4>&gt; COMIDA</h4>
                <ul>
                  {comidaItens.length > 0 ? comidaItens.map((item, idx) => (
                    <li key={`food-${idx}`}>{item.toUpperCase()}</li>
                  )) : <li>SEM ITENS SELECIONADOS</li>}
                </ul>
              </section>

              <section className="pdf-elegant-section">
                <h4>&gt; FINALIZACAO</h4>
                <ul>
                  {finalizacaoItens.length > 0 ? finalizacaoItens.map((item, idx) => (
                    <li key={`finish-${idx}`}>{item.toUpperCase()}</li>
                  )) : <li>SEM FINALIZACAO ADICIONAL</li>}
                </ul>
              </section>

              <div className="pdf-elegant-grid">
                <section className="pdf-elegant-section">
                  <h4>&gt; EQUIPE</h4>
                  <ul>
                    {equipeItens.length > 0 ? equipeItens.map((item, idx) => (
                      <li key={`team-${idx}`}>{`${item.name.toUpperCase()} (${numPessoas}X)`}</li>
                    )) : <li>CHURRASQUEIRO 1X</li>}
                  </ul>
                </section>

                <section className="pdf-elegant-section">
                  <h4>&gt; MATERIAL INCLUSO</h4>
                  <ul>
                    {materialItens.length > 0 ? materialItens.map((item, idx) => (
                      <li key={`mat-${idx}`}>{item.name.toUpperCase()}</li>
                    )) : <li>MATERIAL BASICO DO EVENTO</li>}
                  </ul>
                </section>
              </div>
            </div>

            <div className="pdf-elegant-table-wrap">
              <table className="pdf-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>ITEM</th>
                    <th style={{ textAlign: 'left' }}>VALOR</th>
                    <th style={{ textAlign: 'left' }}>QTD</th>
                  </tr>
                </thead>
                <tbody>
                  {churrasco && (
                    <tr>
                      <td style={{ textAlign: 'left' }}>{churrasco.name.toUpperCase()}</td>
                      <td style={{ textAlign: 'left' }}>SOB CONSULTA</td>
                      <td style={{ textAlign: 'left' }}>{numPessoas}</td>
                    </tr>
                  )}
                  {bebidas.length > 0 && (
                    bebidas.map((beb, idx) => (
                      <tr key={`beb-${idx}`}>
                        <td style={{ textAlign: 'left' }}>{`${beb.categoryName ? `${beb.categoryName} - ` : ''}${beb.option}`.toUpperCase()}</td>
                        <td style={{ textAlign: 'left' }}>INCLUSO</td>
                        <td style={{ textAlign: 'left' }}>-</td>
                      </tr>
                    ))
                  )}
                  {extras.length > 0 && (
                    <>
                      <tr style={{ background: 'rgba(0, 0, 0, 0.05)' }}>
                        <td colSpan="3" style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#111', padding: '0.4rem 0.6rem', textAlign: 'left' }}>SERVIÇOS</td>
                      </tr>
                      {extras.map((extra, idx) => (
                        <tr key={`extra-table-${idx}`}>
                          <td style={{ textAlign: 'left' }}>{extra.name.toUpperCase()}</td>
                          <td style={{ textAlign: 'left' }}>INCLUSO</td>
                          <td style={{ textAlign: 'left' }}>1</td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
              <div className="pdf-total-row">
                <span className="pdf-total-label">TOTAL</span>
                <span className="pdf-total-value">SOB CONSULTA</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="pdf-header">
              <div className="pdf-header-brand">
                <p className="pdf-eyebrow">Mestre das Chamas</p>
                <h2>Orçamento do Evento</h2>
                <p className="pdf-header-subtitle">Parrilla, bebidas e serviços completos</p>
              </div>

              <div className="pdf-header-package">
                <span className="pdf-package-label">Pacote Selecionado</span>
                <strong>{churrasco?.name}</strong>
              </div>

              <div className="pdf-header-logo">
                <img src="/img/oyama-logo.png" alt="Logo" className="logo-image" />
              </div>
            </div>

            <div className="pdf-body">
              <div className="pdf-info-section">
                <div className="info-item"><div className="info-content"><span className="info-label">Cliente</span><span className="info-value">{clienteNome || 'Não informado'}</span></div></div>
                <div className="info-item"><div className="info-content"><span className="info-label">WhatsApp</span><span className="info-value">{clienteWhatsapp || 'Não informado'}</span></div></div>
                <div className="info-item"><div className="info-content"><span className="info-label">Data</span><span className="info-value">{dataFormatada}</span></div></div>
                <div className="info-item"><div className="info-content"><span className="info-label">Horário</span><span className="info-value">{horario || 'A definir'}</span></div></div>
                <div className="info-item"><div className="info-content"><span className="info-label">Local</span><span className="info-value">{local || 'A definir'}</span></div></div>
                <div className="info-item"><div className="info-content"><span className="info-label">Convidados</span><span className="info-value">{numPessoas} pessoas</span></div></div>
              </div>

              <div className="pdf-two-columns">
                <div className="pdf-column">
                  <h4 className="pdf-section-title">Cardapio</h4>
                  {churrasco?.isCustom && carnesCustomizadas && carnesCustomizadas.length > 0
                    ? carnesCustomizadas.map((item, idx) => <div key={`meat-${idx}`} className="pdf-list-item">• {item}</div>)
                    : churrasco?.meats?.map((item, idx) => <div key={`meat-${idx}`} className="pdf-list-item">• {item}</div>)}

                  {churrasco?.isCustom && acompanhamentosCustomizados && acompanhamentosCustomizados.length > 0
                    ? acompanhamentosCustomizados.map((item, idx) => <div key={`side-${idx}`} className="pdf-list-item">• {item}</div>)
                    : churrasco?.sideDishes?.map((item, idx) => <div key={`side-${idx}`} className="pdf-list-item">• {item}</div>)}
                </div>

                <div className="pdf-column">
                  <h4 className="pdf-section-title">Bebidas</h4>
                  {bebidas.length > 0 ? (
                    bebidas.map((beb, idx) => (
                      <div key={`beb-${idx}`} className="pdf-list-item">
                        • {beb.categoryName ? `${beb.categoryName} - ` : ''}{beb.option}
                      </div>
                    ))
                  ) : (
                    <div className="pdf-list-item">Nenhuma bebida selecionada</div>
                  )}
                </div>
              </div>

              {extras.length > 0 && (
                <div className="pdf-section">
                  <h4 className="pdf-section-title">Servicos e Extras</h4>
                  <div className="pdf-extras-grid">
                    {extras.map((extra, idx) => (
                      <div key={`extra-${idx}`} className="pdf-extra-chip">+ {extra.name}</div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pdf-table-section">
                <table className="pdf-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>DESCRICAO</th>
                      <th style={{ textAlign: 'left' }}>VALOR UN.</th>
                      <th style={{ textAlign: 'left' }}>QTD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {churrasco && (
                      <tr>
                        <td style={{ textAlign: 'left' }}>{churrasco.name}</td>
                        <td style={{ textAlign: 'left' }}>Sob consulta</td>
                        <td style={{ textAlign: 'left' }}>{numPessoas}</td>
                      </tr>
                    )}
                    {bebidas.length > 0 && (
                      bebidas.map((beb, idx) => (
                        <tr key={`beb-${idx}`}>
                          <td style={{ textAlign: 'left' }}>{beb.categoryName ? `${beb.categoryName} - ` : ''}{beb.option}</td>
                          <td style={{ textAlign: 'left' }}>Incluso</td>
                          <td style={{ textAlign: 'left' }}>-</td>
                        </tr>
                      ))
                    )}
                    {extras.length > 0 && (
                      <>
                        <tr style={{ background: 'rgba(0, 0, 0, 0.05)' }}>
                          <td colSpan="3" style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#111', padding: '0.4rem 0.6rem', textAlign: 'left' }}>SERVIÇOS</td>
                        </tr>
                        {extras.map((extra, idx) => (
                          <tr key={`extra-table-${idx}`}>
                            <td style={{ textAlign: 'left' }}>{extra.name}</td>
                            <td style={{ textAlign: 'left' }}>Incluso</td>
                            <td style={{ textAlign: 'left' }}>1</td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>

                <div className="pdf-total-row">
                  <span className="pdf-total-label">Total do Evento</span>
                  <span className="pdf-total-value">Sob consulta</span>
                </div>
              </div>

              <p className="pdf-footer-note">Documento gerado automaticamente para conferencia e fechamento do pedido.</p>
            </div>
          </>
        )}
      </div>

      <div className="resumo-controls">
        <h3>📝 Detalhes do Evento</h3>
        <div className="pdf-input-section">
          <div className="pdf-input-group">
            <label>📅 Data:</label>
            <input type="date" value={data} min={todayISO} onChange={(e) => setData(e.target.value)} required />
          </div>
          <div className="pdf-input-group">
            <label>🕐 Horário:</label>
            <input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} required />
          </div>
          <div className="pdf-input-group">
            <label>📍 Local:</label>
            <input type="text" placeholder="Digite o local do evento" value={local} onChange={(e) => setLocal(e.target.value)} required />
          </div>
        </div>

        <button onClick={gerarMensagemWhatsApp} disabled={!isValidBudget() || isSending} className="btn-whatsapp">
          {isSending ? 'Gerando PDF...' : '💬 Enviar Pedido por WhatsApp'}
        </button>
        {!isValidBudget() && (
          <p className="validation-warning">
            ⚠️ Preencha todos os campos e use uma data igual ou posterior a hoje
          </p>
        )}
      </div>
    </div>
  );
};

export default Resumo;
