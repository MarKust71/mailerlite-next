-- CreateTable
CREATE TABLE "public"."Subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "mailerLiteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mailerLiteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubscriberGroup" (
    "subscriberId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriberGroup_pkey" PRIMARY KEY ("subscriberId","groupId")
);

-- CreateTable
CREATE TABLE "public"."CustomField" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "mailerLiteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubscriberFieldValue" (
    "id" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "customFieldId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "SubscriberFieldValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "public"."Subscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_mailerLiteId_key" ON "public"."Subscriber"("mailerLiteId");

-- CreateIndex
CREATE UNIQUE INDEX "Group_mailerLiteId_key" ON "public"."Group"("mailerLiteId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomField_key_key" ON "public"."CustomField"("key");

-- CreateIndex
CREATE UNIQUE INDEX "CustomField_mailerLiteId_key" ON "public"."CustomField"("mailerLiteId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriberFieldValue_subscriberId_customFieldId_key" ON "public"."SubscriberFieldValue"("subscriberId", "customFieldId");

-- AddForeignKey
ALTER TABLE "public"."SubscriberGroup" ADD CONSTRAINT "SubscriberGroup_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "public"."Subscriber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubscriberGroup" ADD CONSTRAINT "SubscriberGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubscriberFieldValue" ADD CONSTRAINT "SubscriberFieldValue_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "public"."Subscriber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubscriberFieldValue" ADD CONSTRAINT "SubscriberFieldValue_customFieldId_fkey" FOREIGN KEY ("customFieldId") REFERENCES "public"."CustomField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
