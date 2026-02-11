from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from django.utils import timezone

def generate_invoice_pdf(order):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm,
                           topMargin=2*cm, bottomMargin=2*cm)
    elements = []
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#8B4513'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    title = Paragraph("FACTURE - CENDRES ET VAPEUR", title_style)
    elements.append(title)
    elements.append(Spacer(1, 0.5*cm))
    
    order_info = f"""
    <b>Numéro de commande:</b> {order.order_number}<br/>
    <b>Date:</b> {order.created_at.strftime('%d/%m/%Y %H:%M')}<br/>
    <b>Statut:</b> {order.get_status_display()}<br/>
    <b>Client:</b> {order.user.get_full_name() or order.user.username}<br/>
    <b>Email:</b> {order.user.email}
    """
    elements.append(Paragraph(order_info, styles['Normal']))
    elements.append(Spacer(1, 1*cm))
    
    data = [['Produit', 'Prix unitaire', 'Quantité', 'Sous-total']]
    for item in order.items.all():
        data.append([
            item.product_name,
            f"{item.product_price}€",
            str(item.quantity),
            f"{item.subtotal}€"
        ])
    
    data.append(['', '', 'Sous-total:', f"{order.subtotal}€"])
    if order.discount_amount > 0:
        data.append(['', '', f'Réduction ({order.discount_code.code}):', f"-{order.discount_amount}€"])
    data.append(['', '', '<b>TOTAL:</b>', f"<b>{order.total}€</b>"])
    
    table = Table(data, colWidths=[8*cm, 3*cm, 3*cm, 3*cm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#8B4513')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -4), 0.5, colors.grey),
        ('LINEABOVE', (2, -3), (-1, -3), 1, colors.black),
        ('LINEABOVE', (2, -1), (-1, -1), 2, colors.black),
        ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 1*cm))
    
    footer_text = """Merci pour votre commande !<br/>Pour toute question, contactez-nous à <a href="mailto:test@example.com">test@example.com</a>."""
    
    elements.append(Paragraph(footer_text, styles['Normal']))
    doc.build(elements)
    buffer.seek(0)
    return buffer
