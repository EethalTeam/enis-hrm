
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Helmet } from 'react-helmet';

const PagePlaceholder = ({ title, icon: Icon }) => {
  return (
    <>
      <Helmet>
        <title>{title} | HRMS Corp</title>
        <meta name="description" content={`Manage ${title.toLowerCase()} within the HRMS Corp system.`} />
        <meta property="og:title" content={`${title} | HRMS Corp`} />
        <meta property="og:description" content={`Manage ${title.toLowerCase()} within the HRMS Corp system.`} />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Card className="bg-gray-800 border-gray-700 text-white shadow-2xl shadow-purple-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              {Icon && <Icon className="h-8 w-8 text-purple-400" />}
              <span>{title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-16 px-6 border-2 border-dashed border-gray-700 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-300">Coming Soon!</h2>
              <p className="text-gray-400 mt-2">
                The {title} page is currently under construction.
              </p>
              <p className="text-gray-400 mt-1">You can request this feature in your next prompt. 🚀</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default PagePlaceholder;
  