"""
Report generation service
"""
from datetime import datetime
from io import BytesIO
from motor.motor_asyncio import AsyncIOMotorDatabase
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet


class ReportService:
    """Report generation service"""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def generate_portfolio_summary_pdf(
        self, user_id: str, user_name: str, user_email: str
    ) -> BytesIO:
        """Generate portfolio summary PDF report"""
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []
        styles = getSampleStyleSheet()

        # Title
        elements.append(
            Paragraph("<b>Binary Bonds - Portfolio Summary</b>", styles["Title"])
        )
        elements.append(
            Paragraph(
                f"Generated on: {datetime.utcnow().strftime('%d/%m/%Y')}",
                styles["Normal"],
            )
        )
        elements.append(Spacer(1, 0.3 * inch))

        # User info
        elements.append(Paragraph(f"<b>Client Name:</b> {user_name}", styles["Normal"]))
        elements.append(Paragraph(f"<b>Email:</b> {user_email}", styles["Normal"]))
        elements.append(Spacer(1, 0.3 * inch))

        # Get portfolio data
        user_bonds = await self.db.user_bonds.find({"user_id": user_id}).to_list(1000)

        # Table data
        table_data = [
            ["Bond Name", "ISIN", "Quantity", "Face Value", "Invested Amount"]
        ]

        total_invested = 0
        for ub in user_bonds:
            bond = await self.db.bonds.find_one({"_id": ub["bond_id"]})
            if bond:
                table_data.append(
                    [
                        bond["name"][:30],
                        bond["isin"],
                        str(ub["quantity"]),
                        f"₹{bond['face_value']:,.0f}",
                        f"₹{ub['invested_amount']:,.0f}",
                    ]
                )
                total_invested += ub["invested_amount"]

        table_data.append(["", "", "", "Total", f"₹{total_invested:,.0f}"])

        # Create table
        table = Table(table_data)
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                    ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
                ]
            )
        )

        elements.append(table)
        elements.append(Spacer(1, 0.3 * inch))

        # Footer
        elements.append(
            Paragraph(
                "<i>This report is generated for informational purposes only. Please verify all information with your broker.</i>",
                styles["Normal"],
            )
        )

        doc.build(elements)
        buffer.seek(0)
        return buffer
