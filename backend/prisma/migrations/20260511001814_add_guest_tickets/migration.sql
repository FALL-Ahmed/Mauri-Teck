-- CreateTable
CREATE TABLE "guest_tickets" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT,
    "guestPhone" TEXT,
    "guestPhoto" TEXT,
    "eventId" TEXT NOT NULL,
    "qrCode" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scannedAt" TIMESTAMP(3),
    "scannedBy" TEXT,

    CONSTRAINT "guest_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guest_tickets_ticketNumber_key" ON "guest_tickets"("ticketNumber");

-- AddForeignKey
ALTER TABLE "guest_tickets" ADD CONSTRAINT "guest_tickets_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
